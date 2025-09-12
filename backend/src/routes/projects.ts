import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/db';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  projectQuerySchema,
  paginationSchema,
  CreateProjectInput,
  UpdateProjectInput,
} from '../schemas/validation';

export async function projectRoutes(fastify: FastifyInstance) {
  // GET /api/projects - List all projects with filtering and pagination
  fastify.get('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate query parameters
      const queryValidation = paginationSchema.merge(projectQuerySchema).safeParse(request.query);

      if (!queryValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid query parameters',
          details: queryValidation.error.errors,
        });
      }

      const {
        page = 1,
        limit = 20,
        sortBy = 'featuredPriority',
        sortOrder = 'asc',
        ...filters
      } = queryValidation.data;

      // Build where clause
      const where: any = {};

      if (filters.projectType) {
        where.projectType = filters.projectType;
      }

      if (filters.isAcademic !== undefined) {
        where.isAcademic = filters.isAcademic;
      }

      if (filters.isCompetition !== undefined) {
        where.isCompetition = filters.isCompetition;
      }

      if (filters.yearStart) {
        where.yearStart = { gte: filters.yearStart };
      }

      if (filters.yearEnd) {
        where.yearCompletion = { lte: filters.yearEnd };
      }

      if (filters.search) {
        where.OR = [
          { projectName: { contains: filters.search } },
          { location: { contains: filters.search } },
          { briefDescription: { contains: filters.search } },
        ];
      }

      // Get total count
      const total = await prisma.project.count({ where });

      // Get paginated results
      const projects = await prisma.project.findMany({
        where,
        include: {
          assets: {
            orderBy: { displayOrder: 'asc' },
          },
          _count: {
            select: { assets: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  });

  // GET /api/projects/:id - Get single project
  fastify.get('/projects/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Validate ID
      const idValidation = projectIdSchema.safeParse(request.params);

      if (!idValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid project ID',
          details: idValidation.error.errors,
        });
      }

      const project = await prisma.project.findUnique({
        where: { id: request.params.id },
        include: {
          assets: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!project) {
        return reply.code(404).send({
          success: false,
          error: 'Project not found'
        });
      }

      return { success: true, data: project };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch project'
      });
    }
  });

  // POST /api/projects - Create new project
  fastify.post('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const bodyValidation = createProjectSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid project data',
          details: bodyValidation.error.errors,
        });
      }

      const project = await prisma.project.create({
        data: bodyValidation.data,
        include: {
          assets: true,
        },
      });

      return reply.code(201).send({ success: true, data: project });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create project'
      });
    }
  });

  // PUT /api/projects/:id - Update project
  fastify.put('/projects/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Validate ID
      const idValidation = projectIdSchema.safeParse(request.params);

      if (!idValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid project ID',
          details: idValidation.error.errors,
        });
      }

      // Validate request body
      const bodyValidation = updateProjectSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid update data',
          details: bodyValidation.error.errors,
        });
      }

      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { id: request.params.id },
      });

      if (!existing) {
        return reply.code(404).send({
          success: false,
          error: 'Project not found'
        });
      }

      // Update project
      const project = await prisma.project.update({
        where: { id: request.params.id },
        data: bodyValidation.data,
        include: {
          assets: true,
        },
      });

      return { success: true, data: project };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update project'
      });
    }
  });

  // DELETE /api/projects/:id - Delete project
  fastify.delete('/projects/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Validate ID
      const idValidation = projectIdSchema.safeParse(request.params);

      if (!idValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid project ID',
          details: idValidation.error.errors,
        });
      }

      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { id: request.params.id },
      });

      if (!existing) {
        return reply.code(404).send({
          success: false,
          error: 'Project not found'
        });
      }

      // Delete project (assets will be cascade deleted)
      await prisma.project.delete({
        where: { id: request.params.id },
      });

      return { success: true, message: 'Project deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete project'
      });
    }
  });

  // GET /api/projects/:id/assets - Get project assets
  fastify.get('/projects/:id/assets', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      // Validate ID
      const idValidation = projectIdSchema.safeParse(request.params);

      if (!idValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid project ID',
          details: idValidation.error.errors,
        });
      }

      const assets = await prisma.projectAsset.findMany({
        where: { projectId: request.params.id },
        orderBy: { displayOrder: 'asc' },
      });

      return { success: true, data: assets };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch assets'
      });
    }
  });


}