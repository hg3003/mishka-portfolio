import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export const errorHandler = async (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  request.log.error(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      success: false,
      error: 'Validation error',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

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
}