import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/db';
import {
  createExperienceSchema,
  updateExperienceSchema,
  createEducationSchema,
  updateEducationSchema,
  createSkillSchema,
  updateSkillSchema,
  updatePersonalInfoSchema,
} from '../schemas/validation';

export async function cvRoutes(fastify: FastifyInstance) {
  // ==================== PERSONAL INFO ====================

  // GET /api/cv/personal-info
  fastify.get('/cv/personal-info', async (request, reply) => {
    try {
      let personalInfo = await prisma.personalInfo.findFirst();

      // If no personal info exists, create a default one
      if (!personalInfo) {
        personalInfo = await prisma.personalInfo.create({
          data: {
            name: 'Your Name',
            professionalTitle: 'Architect',
            email: 'email@example.com',
            location: 'London, UK',
          },
        });
      }

      return { success: true, data: personalInfo };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch personal info',
      });
    }
  });

  // PUT /api/cv/personal-info
  fastify.put('/cv/personal-info', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bodyValidation = updatePersonalInfoSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        fastify.log.warn(
          { zodErrors: bodyValidation.error.errors, body: request.body },
          'PersonalInfo validation failed'
        );
        return reply.code(400).send({
          success: false,
          error: 'Invalid personal info data',
          details: bodyValidation.error.errors,
        });
      }

      let personalInfo = await prisma.personalInfo.findFirst();
      if (!personalInfo) {
        personalInfo = await prisma.personalInfo.create({
          data: {
            name: 'Your Name',
            professionalTitle: 'Architect',
            email: 'email@example.com',
            location: 'London, UK',
            ...bodyValidation.data,
          },
        });
      } else {
        personalInfo = await prisma.personalInfo.update({
          where: { id: personalInfo.id },
          data: bodyValidation.data,
        });
      }

      return { success: true, data: personalInfo };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to update personal info' });
    }
  });

  // ==================== EXPERIENCE ====================

  // GET /api/cv/experience
  fastify.get('/cv/experience', async (request, reply) => {
    try {
      const experiences = await prisma.cVExperience.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return { success: true, data: experiences };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch experiences',
      });
    }
  });

  // POST /api/cv/experience
  fastify.post('/cv/experience', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const bodyValidation = createExperienceSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid experience data',
          details: bodyValidation.error.errors,
        });
      }

      const experience = await prisma.cVExperience.create({
        data: {
          ...bodyValidation.data,
          startDate: new Date(bodyValidation.data.startDate),
          endDate: bodyValidation.data.endDate ? new Date(bodyValidation.data.endDate) : undefined,
        },
      });

      return reply.code(201).send({ success: true, data: experience });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create experience',
      });
    }
  });

  // PUT /api/cv/experience/:id
  fastify.put(
    '/cv/experience/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        // Validate request body
        const bodyValidation = updateExperienceSchema.safeParse(request.body);

        if (!bodyValidation.success) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid experience data',
            details: bodyValidation.error.errors,
          });
        }

        const data: any = { ...bodyValidation.data };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const experience = await prisma.cVExperience.update({
          where: { id: request.params.id },
          data,
        });

        return { success: true, data: experience };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Experience not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update experience',
        });
      }
    }
  );

  // DELETE /api/cv/experience/:id
  fastify.delete(
    '/cv/experience/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        await prisma.cVExperience.delete({
          where: { id: request.params.id },
        });
        return { success: true, message: 'Experience deleted successfully' };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Experience not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete experience',
        });
      }
    }
  );

  // ==================== EDUCATION ====================

  // GET /api/cv/education
  fastify.get('/cv/education', async (request, reply) => {
    try {
      const education = await prisma.cVEducation.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return { success: true, data: education };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch education',
      });
    }
  });

  // POST /api/cv/education
  fastify.post('/cv/education', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const bodyValidation = createEducationSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid education data',
          details: bodyValidation.error.errors,
        });
      }

      const education = await prisma.cVEducation.create({
        data: {
          ...bodyValidation.data,
          startDate: new Date(bodyValidation.data.startDate),
          endDate: bodyValidation.data.endDate ? new Date(bodyValidation.data.endDate) : undefined,
        },
      });

      return reply.code(201).send({ success: true, data: education });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create education',
      });
    }
  });

  // PUT /api/cv/education/:id
  fastify.put(
    '/cv/education/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        // Validate request body
        const bodyValidation = updateEducationSchema.safeParse(request.body);

        if (!bodyValidation.success) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid education data',
            details: bodyValidation.error.errors,
          });
        }

        const data: any = { ...bodyValidation.data };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const education = await prisma.cVEducation.update({
          where: { id: request.params.id },
          data,
        });

        return { success: true, data: education };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Education not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update education',
        });
      }
    }
  );

  // DELETE /api/cv/education/:id
  fastify.delete(
    '/cv/education/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        await prisma.cVEducation.delete({
          where: { id: request.params.id },
        });
        return { success: true, message: 'Education deleted successfully' };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Education not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete education',
        });
      }
    }
  );

  // ==================== SKILLS ====================

  // GET /api/cv/skills
  fastify.get('/cv/skills', async (request, reply) => {
    try {
      const skills = await prisma.cVSkill.findMany({
        orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
      });
      return { success: true, data: skills };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch skills',
      });
    }
  });

  // POST /api/cv/skills
  fastify.post('/cv/skills', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const bodyValidation = createSkillSchema.safeParse(request.body);

      if (!bodyValidation.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid skill data',
          details: bodyValidation.error.errors,
        });
      }

      const skill = await prisma.cVSkill.create({
        data: bodyValidation.data,
      });

      return reply.code(201).send({ success: true, data: skill });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create skill',
      });
    }
  });

  // PUT /api/cv/skills/:id
  fastify.put(
    '/cv/skills/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        // Validate request body
        const bodyValidation = updateSkillSchema.safeParse(request.body);

        if (!bodyValidation.success) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid skill data',
            details: bodyValidation.error.errors,
          });
        }

        const skill = await prisma.cVSkill.update({
          where: { id: request.params.id },
          data: bodyValidation.data,
        });

        return { success: true, data: skill };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Skill not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update skill',
        });
      }
    }
  );

  // DELETE /api/cv/skills/:id
  fastify.delete(
    '/cv/skills/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        await prisma.cVSkill.delete({
          where: { id: request.params.id },
        });
        return { success: true, message: 'Skill deleted successfully' };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.code(404).send({
            success: false,
            error: 'Skill not found',
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete skill',
        });
      }
    }
  );

  // ==================== BULK OPERATIONS ====================

  // GET /api/cv/renderable - build CV-only renderable JSON
  fastify.get('/cv/renderable', async (request, reply) => {
    try {
      const { buildRenderableCV } = await import('../services/cvData');
      const data = await buildRenderableCV();
      return { success: true, data };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to build CV renderable' });
    }
  });

  // POST /api/cv/generate - generate standalone CV PDF via Playwright
  fastify.post('/cv/generate', async (request, reply) => {
    try {
      const { generateCvPdfPlaywright } = await import('../services/cvGenerator');
      const result = await generateCvPdfPlaywright();
      return reply.code(201).send({ success: true, data: result });
    } catch (error: any) {
      if (error?.code === 'PLAYWRIGHT_MISSING') {
        return reply.code(500).send({ success: false, error: error.message });
      }
      fastify.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to generate CV PDF' });
    }
  });


  // GET /api/cv/all - Get all CV data at once
  fastify.get('/cv/all', async (request, reply) => {
    try {
      const [personalInfo, experiences, education, skills] = await Promise.all([
        prisma.personalInfo.findFirst(),
        prisma.cVExperience.findMany({ orderBy: { displayOrder: 'asc' } }),
        prisma.cVEducation.findMany({ orderBy: { displayOrder: 'asc' } }),
        prisma.cVSkill.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] }),
      ]);

      return {
        success: true,
        data: {
          personalInfo,
          experiences,
          education,
          skills,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch CV data',
      });
    }
  });
}
