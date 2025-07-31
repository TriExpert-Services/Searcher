import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(healthCheck);
}));

router.get('/ready', asyncHandler(async (_req: Request, res: Response) => {
  // Aquí puedes agregar checks de dependencias (DB, servicios externos, etc.)
  res.json({ status: 'Ready' });
}));

export { router as healthRoutes };