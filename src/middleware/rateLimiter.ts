import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Demasiadas peticiones',
    message: 'Has superado el límite de peticiones. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas peticiones',
      message: 'Has superado el límite de peticiones. Intenta de nuevo más tarde.',
      retryAfter: Math.round(config.rateLimit.windowMs / 1000)
    });
  }
});