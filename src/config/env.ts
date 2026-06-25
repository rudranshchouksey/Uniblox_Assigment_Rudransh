import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api'),
  NTH_ORDER: z.coerce.number().default(3),
  DISCOUNT_PERCENTAGE: z.coerce.number().default(10),
  FRONTEND_URL: z.string().url().default('https://uniblox-assigment-rudransh-frontend.vercel.app'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
