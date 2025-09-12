// backend/src/routes/settings.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/db';
import { z } from 'zod';

const colorSchemeEnum = z.enum(['classic', 'modernBlue', 'warmMinimal']);

export async function settingsRoutes(fastify: FastifyInstance) {
  // GET /api/settings - global app settings (create default if missing)
  fastify.get('/settings', async (_req, reply) => {
    try {
      let settings = await prisma.appSettings.findUnique({ where: { id: 'global' } });
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            id: 'global',
            colorScheme: 'classic',
            margins: { top: 15, bottom: 15, left: 15, right: 15 },
          },
        });
      }
      return { success: true, data: settings };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to fetch settings' });
    }
  });

  // PUT /api/settings - update global settings
  fastify.put('/settings', async (request, reply) => {
    try {
      const schema = z.object({
        colorScheme: colorSchemeEnum.optional(),
        margins: z
          .object({
            top: z.coerce.number().min(0).max(40).optional(),
            bottom: z.coerce.number().min(0).max(40).optional(),
            left: z.coerce.number().min(0).max(40).optional(),
            right: z.coerce.number().min(0).max(40).optional(),
          })
          .partial()
          .optional(),
      });
      const body = schema.parse(request.body || {});

      const existing =
        (await prisma.appSettings.findUnique({ where: { id: 'global' } })) ||
        (await prisma.appSettings.create({
          data: { id: 'global', colorScheme: 'classic', margins: { top: 15, bottom: 15, left: 15, right: 15 } },
        }));

      const nextMargins = {
        ...(existing.margins as any),
        ...(body.margins || {}),
      };

      const updated = await prisma.appSettings.update({
        where: { id: 'global' },
        data: {
          colorScheme: body.colorScheme ?? existing.colorScheme,
          margins: nextMargins,
        },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return reply.code(400).send({ success: false, error: 'Invalid settings', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ success: false, error: 'Failed to update settings' });
    }
  });
}
