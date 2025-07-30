import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { searchRoutes } from './routes/search.js';
import { healthRoutes } from './routes/health.js';
import { swaggerSetup } from './config/swagger.js';

const app = express();

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Documentación Swagger
swaggerSetup(app);

// Rutas
app.use('/api/health', healthRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler global
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`🚀 Servidor iniciado en puerto ${config.port}`);
  logger.info(`📖 Documentación disponible en http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;