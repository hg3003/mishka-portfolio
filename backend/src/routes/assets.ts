import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/db';
import { 
  processImage, 
  processDocument, 
  validateFileType, 
  deleteUploadedFiles,
  ensureUploadDirs 
} from '../services/uploadService';
import { updateAssetSchema } from '../schemas/validation';
import { z } from 'zod';

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export async function assetRoutes(fastify: FastifyInstance) {
  // Ensure upload directories exist on startup
  await ensureUploadDirs();

  // POST /api/assets/upload/:projectId - Upload asset for a project
  fastify.post('/assets/upload/:projectId', async (request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) => {
    try {
      const { projectId } = request.params;

      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return reply.code(404).send({
          success: false,
          error: 'Project not found',
        });
      }

      // Get uploaded file
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No file uploaded',
        });
      }

      // Validate file type
      if (!validateFileType(data.mimetype, ALL_ALLOWED_TYPES)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, PDF',
        });
      }

      // Process file based on type
      let uploadedFile;
      let assetType;

      if (ALLOWED_IMAGE_TYPES.includes(data.mimetype)) {
        // Process as image
        uploadedFile = await processImage(data, {
          maxWidth: 2400,
          maxHeight: 2400,
          quality: 85,
          generateThumbnail: true,
        });
        
        // Determine asset type based on filename or default to IMAGE
        if (data.filename.toLowerCase().includes('render')) {
          assetType = 'RENDER';
        } else if (data.filename.toLowerCase().includes('sketch')) {
          assetType = 'SKETCH';
        } else if (data.filename.toLowerCase().includes('diagram')) {
          assetType = 'DIAGRAM';
        } else if (data.filename.toLowerCase().includes('model')) {
          assetType = 'MODEL_PHOTO';
        } else {
          assetType = 'IMAGE';
        }
      } else {
        // Process as document
        uploadedFile = await processDocument(data);
        assetType = 'DRAWING'; // Default for PDFs
      }

      // Get current max display order
      const maxOrder = await prisma.projectAsset.findFirst({
        where: { projectId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });

      // Save to database
      const asset = await prisma.projectAsset.create({
        data: {
          projectId,
          assetType,
          filePath: uploadedFile.path,
          fileName: uploadedFile.filename,
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimetype,
          width: uploadedFile.width,
          height: uploadedFile.height,
          displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
          canBeCropped: true,
        },
      });

      return reply.code(201).send({
        success: true,
        data: {
          ...asset,
          url: uploadedFile.url,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to upload asset',
      });
    }
  });

  // POST /api/assets/upload-multiple/:projectId - Upload multiple assets
  fastify.post('/assets/upload-multiple/:projectId', async (request: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) => {
    try {
      const { projectId } = request.params;

      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return reply.code(404).send({
          success: false,
          error: 'Project not found',
        });
      }

      const parts = request.parts();
      const uploadedAssets = [];
      const errors = [];

      // Get current max display order
      const maxOrder = await prisma.projectAsset.findFirst({
        where: { projectId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });

      let currentOrder = (maxOrder?.displayOrder ?? -1) + 1;

      for await (const part of parts) {
        if (part.type === 'file') {
          try {
            // Validate file type
            if (!validateFileType(part.mimetype, ALL_ALLOWED_TYPES)) {
              errors.push({
                file: part.filename,
                error: 'Invalid file type',
              });
              continue;
            }

            // Process file
            let uploadedFile;
            let assetType;

            if (ALLOWED_IMAGE_TYPES.includes(part.mimetype)) {
              uploadedFile = await processImage(part);
              assetType = 'IMAGE';
            } else {
              uploadedFile = await processDocument(part);
              assetType = 'DRAWING';
            }

            // Save to database
            const asset = await prisma.projectAsset.create({
              data: {
                projectId,
                assetType,
                filePath: uploadedFile.path,
                fileName: uploadedFile.filename,
                fileSize: uploadedFile.size,
                mimeType: uploadedFile.mimetype,
                width: uploadedFile.width,
                height: uploadedFile.height,
                displayOrder: currentOrder++,
                canBeCropped: true,
              },
            });

            uploadedAssets.push({
              ...asset,
              url: uploadedFile.url,
            });
          } catch (error) {
            errors.push({
              file: part.filename,
              error: 'Failed to process file',
            });
          }
        }
      }

      return reply.code(201).send({
        success: true,
        data: {
          uploaded: uploadedAssets,
          errors,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to upload assets',
      });
    }
  });

  // GET /api/assets/:id - Get single asset
  fastify.get('/assets/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const asset = await prisma.projectAsset.findUnique({
        where: { id: request.params.id },
        include: {
          project: {
            select: {
              projectName: true,
              projectType: true,
            },
          },
        },
      });

      if (!asset) {
        return reply.code(404).send({
          success: false,
          error: 'Asset not found',
        });
      }

      // Add URL to response
      const url = asset.mimeType.startsWith('image/') 
        ? `/uploads/projects/optimized/${asset.fileName}`
        : `/uploads/projects/originals/${asset.fileName}`;

      return {
        success: true,
        data: {
          ...asset,
          url,
          thumbnailUrl: asset.mimeType.startsWith('image/') 
            ? `/uploads/projects/thumbnails/${asset.fileName.replace(/\.[^.]+$/, '_thumb.jpeg')}`
            : null,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch asset',
      });
    }
  });

  // PUT /api/assets/:id - Update asset metadata
  fastify.put('/assets/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Validate request body
      const bodyValidation = updateAssetSchema.safeParse(request.body);
      
      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid asset data',
          details: bodyValidation.error.errors,
        });
      }

      // Check if asset exists
      const existing = await prisma.projectAsset.findUnique({
        where: { id: request.params.id },
      });

      if (!existing) {
        return reply.code(404).send({
          success: false,
          error: 'Asset not found',
        });
      }

      // Update asset
      const asset = await prisma.projectAsset.update({
        where: { id: request.params.id },
        data: bodyValidation.data,
      });

      return {
        success: true,
        data: asset,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update asset',
      });
    }
  });

  // DELETE /api/assets/:id - Delete asset
  fastify.delete('/assets/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Get asset details before deletion
      const asset = await prisma.projectAsset.findUnique({
        where: { id: request.params.id },
      });

      if (!asset) {
        return reply.code(404).send({
          success: false,
          error: 'Asset not found',
        });
      }

      // Delete from database
      await prisma.projectAsset.delete({
        where: { id: request.params.id },
      });

      // Delete physical files
      const filesToDelete = [asset.filePath];
      
      // Add thumbnail path if it's an image
      if (asset.mimeType.startsWith('image/')) {
        const thumbnailPath = asset.filePath
          .replace('/optimized/', '/thumbnails/')
          .replace(/\.[^.]+$/, '_thumb.jpeg');
        filesToDelete.push(thumbnailPath);
        
        // Also try to delete original
        const originalPath = asset.filePath.replace('/optimized/', '/originals/');
        filesToDelete.push(originalPath);
      }

      await deleteUploadedFiles(filesToDelete);

      return {
        success: true,
        message: 'Asset deleted successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete asset',
      });
    }
  });

  // POST /api/assets/reorder - Reorder assets
  fastify.post('/assets/reorder', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bodySchema = z.object({
        assets: z.array(
          z.object({
            id: z.string().cuid(),
            displayOrder: z.number().min(0),
          })
        ),
      });

      const bodyValidation = bodySchema.safeParse(request.body);
      
      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid reorder data',
          details: bodyValidation.error.errors,
        });
      }

      // Update each asset's display order
      const updates = bodyValidation.data.assets.map((asset) =>
        prisma.projectAsset.update({
          where: { id: asset.id },
          data: { displayOrder: asset.displayOrder },
        })
      );

      await Promise.all(updates);

      return {
        success: true,
        message: 'Assets reordered successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to reorder assets',
      });
    }
  });

  // POST /api/assets/:id/set-hero - Set asset as hero image
  fastify.post('/assets/:id/set-hero', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Get the asset
      const asset = await prisma.projectAsset.findUnique({
        where: { id: request.params.id },
      });

      if (!asset) {
        return reply.code(404).send({
          success: false,
          error: 'Asset not found',
        });
      }

      // Unset any existing hero image for this project
      await prisma.projectAsset.updateMany({
        where: { 
          projectId: asset.projectId,
          isHeroImage: true,
        },
        data: { isHeroImage: false },
      });

      // Set this asset as hero
      const updatedAsset = await prisma.projectAsset.update({
        where: { id: request.params.id },
        data: { isHeroImage: true },
      });

      return {
        success: true,
        data: updatedAsset,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to set hero image',
      });
    }
  });
}