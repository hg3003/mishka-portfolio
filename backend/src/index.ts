// backend/src/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { checkDatabaseConnection, getDatabaseStats, prisma } from './utils/db';
import { projectRoutes } from './routes/projects';
import { cvRoutes } from './routes/cv';
import { assetRoutes } from './routes/assets';
import { portfolioRoutes } from './routes/portfolios';
import { settingsRoutes } from './routes/settings';
import { getUploadPath } from './utils/paths';

// Load environment variables
dotenv.config();

// Create Fastify instance with proper body parsing
const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  // Add body limit for JSON parsing
  bodyLimit: 30 * 1024 * 1024, // 30MB
});

// Determine if running in Electron
const isElectron = process.env.ELECTRON_RUN === 'true' || process.versions?.electron;

// Get appropriate paths for Electron vs normal Node
const getElectronUploadPath = () => {
  if (isElectron && process.env.USER_DATA_PATH) {
    // In Electron, use app.getPath('userData')
    const uploadsPath = path.join(process.env.USER_DATA_PATH, 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    return uploadsPath;
  }
  // Use the imported getUploadPath for normal operation
  return getUploadPath();
};

// Graceful shutdown handler for Electron
const setupGracefulShutdown = () => {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    try {
      await prisma.$disconnect();
      await fastify.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Windows specific
  if (process.platform === 'win32') {
    process.on('message', (msg) => {
      if (msg === 'shutdown') {
        shutdown('SHUTDOWN');
      }
    });
  }
};

// Error handler
fastify.setErrorHandler(async (error, request, reply) => {
  // Log error
  request.log.error(error);

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return reply.code(409).send({
      success: false,
      error: 'A record with this value already exists',
    });
  }

  if (error.code === 'P2025') {
    return reply.code(404).send({
      success: false,
      error: 'Record not found',
    });
  }

  // Handle Fastify errors
  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      success: false,
      error: error.message,
    });
  }

  // Default error
  return reply.code(500).send({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
});

// Add JSON parser - IMPORTANT: This must be added before routes
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body as string);
    done(null, json);
  } catch (err: any) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

// Health check route
fastify.get('/health', async (request, reply) => {
  const dbConnected = await checkDatabaseConnection();
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: isElectron ? 'electron' : 'node',
    uploadPath: getElectronUploadPath()
  };
});

// Database stats route
fastify.get('/api/stats', async (request, reply) => {
  try {
    const stats = await getDatabaseStats();
    return { success: true, stats };
  } catch (error) {
    reply.code(500).send({ success: false, error: 'Failed to get database stats' });
  }
});

// Start server
const start = async () => {
  try {
    // Database setup for Electron
    if (isElectron && process.env.NODE_ENV === 'production') {
      try {
        // Optimize SQLite for Electron/Desktop use
        await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL');
        await prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL');
        
        // Check if database needs initialization
        const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`;
        console.log('Database tables found:', tableCount);
      } catch (error) {
        console.error('Database setup error:', error);
      }
    }

    // CORS configuration
    await fastify.register(cors, {
      origin: (origin, cb) => {
        // Allow requests from Electron app (file:// protocol) and development
        const allowedOrigins = [
          process.env.FRONTEND_URL || 'http://localhost:5173',
          'http://localhost:3001',
          'http://localhost:3000',
          'file://'
        ];
        
        // In Electron, be more permissive
        if (isElectron) {
          cb(null, true);
        } else if (!origin || allowedOrigins.some(allowed => origin?.startsWith(allowed))) {
          cb(null, true);
        } else {
          cb(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Register multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
        files: 10, // Max number of files
      },
    });

    // Register static file serving for uploads
    const uploadPath = getElectronUploadPath();
    await fastify.register(fastifyStatic, {
      root: uploadPath,
      prefix: '/uploads/',
      decorateReply: false // Required when registering multiple static plugins
    });
    
    // Serve frontend in production (Electron)
    if (process.env.NODE_ENV === 'production' && isElectron) {
      // Serve the built frontend from Electron
      const frontendPath = path.join(__dirname, '../../frontend/dist');
      if (fs.existsSync(frontendPath)) {
        await fastify.register(fastifyStatic, {
          root: frontendPath,
          prefix: '/',
          decorateReply: false
        });
        
        // Catch-all route for SPA routing
        fastify.setNotFoundHandler((request, reply) => {
          if (!request.url.startsWith('/api') && !request.url.startsWith('/uploads')) {
            reply.sendFile('index.html', frontendPath);
          } else {
            reply.code(404).send({ success: false, error: 'Not found' });
          }
        });
      }
    }
    
    // Register routes with prefix
    await fastify.register(projectRoutes, { prefix: '/api' });
    await fastify.register(cvRoutes, { prefix: '/api' });
    await fastify.register(assetRoutes, { prefix: '/api' });
    await fastify.register(portfolioRoutes, { prefix: '/api' });
    await fastify.register(settingsRoutes, { prefix: '/api' });
    
    const port = parseInt(process.env.PORT || '3001');
    // In Electron, bind to 127.0.0.1 instead of localhost for better Windows compatibility
    const host = process.env.HOST || (isElectron ? '127.0.0.1' : 'localhost');
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 Server running at http://${host}:${port}`);
    console.log(`📁 Serving uploads from: ${uploadPath}`);
    console.log(`🏠 Environment: ${isElectron ? 'Electron' : 'Node.js'}`);
    console.log(`🏥 Health check at http://${host}:${port}/health`);
    console.log(`📊 API Stats at http://${host}:${port}/api/stats`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   Projects: http://${host}:${port}/api/projects`);
    console.log(`   Assets: http://${host}:${port}/api/assets`);
    console.log(`   CV Data: http://${host}:${port}/api/cv/all`);
    console.log(`   Portfolios: http://${host}:${port}/api/portfolios`);
    
    // Setup graceful shutdown
    setupGracefulShutdown();
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();