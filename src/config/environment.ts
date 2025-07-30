import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ORIGINS: z.string().default('*'),
  CACHE_TTL: z.string().transform(Number).default('300'), // 5 minutos
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutos
  RATE_LIMIT_MAX: z.string().transform(Number).default('100')
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  cors: {
    allowedOrigins: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',')
  },
  cache: {
    ttl: env.CACHE_TTL
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX
  }
} as const;