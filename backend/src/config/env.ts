import dotenv from 'dotenv';
import { z } from 'zod'; // Add zod to package.json for validation

// Load environment variables
dotenv.config();

// Define validation schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:password@localhost:5432/stock_analyzer'),
  JWT_SECRET: z.string().default('development_jwt_secret_key_2025'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_EXPIRES_IN: z.string().default('7d')
});

// Parse and validate the environment
const envParse = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
});

// Handle validation errors
if (!envParse.success) {
  console.error('❌ Invalid environment variables:', envParse.error.format());
  throw new Error('Invalid environment variables');
}

// Export validated environment
export default envParse.data; 