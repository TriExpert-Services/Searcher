import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(healthCheck);
}));

router.get('/ready', asyncHandler(async (req, res) => {
  // Aquí puedes agregar checks de dependencias (DB, servicios externos, etc.)
  res.json({ status: 'Ready' });
}));

export { router as healthRoutes };