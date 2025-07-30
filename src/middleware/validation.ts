import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './errorHandler.js';

const searchSchema = z.object({
  query: z.string().min(1, 'Query no puede estar vacío').max(100, 'Query demasiado largo'),
  limit: z.string().optional().transform(val => val ? Number(val) : 10),
  offset: z.string().optional().transform(val => val ? Number(val) : 0),
  category: z.string().optional()
});

export const validateSearch = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = searchSchema.parse(req.query);
    req.query = validatedQuery as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError(`Parámetros inválidos: ${error.errors[0]?.message}`, 400);
    }
    next(error);
  }
};