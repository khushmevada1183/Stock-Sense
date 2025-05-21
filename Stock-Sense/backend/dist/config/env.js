"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod"); // Add zod to package.json for validation
// Load environment variables
dotenv_1.default.config();
// Define validation schema for environment variables
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(val => parseInt(val, 10)).default('5000'),
    DATABASE_URL: zod_1.z.string().default('postgresql://postgres:password@localhost:5432/stock_analyzer'),
    JWT_SECRET: zod_1.z.string().default('development_jwt_secret_key_2025'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    API_KEY: zod_1.z.string().default('sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67')
});
// Parse and validate the environment
const envParse = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    API_KEY: process.env.API_KEY
});
// Handle validation errors
if (!envParse.success) {
    console.error('❌ Invalid environment variables:', envParse.error.format());
    throw new Error('Invalid environment variables');
}
// Export validated environment
exports.default = envParse.data;
