import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// In test environment, use relaxed validation with defaults
const isTestEnv = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  
  // JWT Configuration
  JWT_ACCESS_SECRET: isTestEnv ? z.string().default('test_secret_min10chars') : z.string().min(10),
  JWT_REFRESH_SECRET: isTestEnv ? z.string().default('test_refresh_min10chars') : z.string().min(10),
  JWT_ACCESS_EXPIRY: isTestEnv ? z.string().default('15m') : z.string().min(1),
  JWT_REFRESH_EXPIRY: isTestEnv ? z.string().default('7d') : z.string().min(1),
  
  // Infrastructure
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  KAFKA_BROKER: z.string().default('localhost:9092'),
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: isTestEnv ? z.string().default('test') : z.string().min(1, "Cloudinary Cloud Name is required"),
  CLOUDINARY_API_KEY: isTestEnv ? z.string().default('test') : z.string().min(1, "Cloudinary API Key is required"),
  CLOUDINARY_API_SECRET: isTestEnv ? z.string().default('test') : z.string().min(1, "Cloudinary API Secret is required"),

  // Razorpay Configuration
  RAZORPAY_KEY_ID: isTestEnv ? z.string().default('test') : z.string().min(1, "Razorpay Key ID is required"),
  RAZORPAY_KEY_SECRET: isTestEnv ? z.string().default('test') : z.string().min(1, "Razorpay Key Secret is required"),

  // ML Tuning
  HOT_EVENT_BOOKING_THRESHOLD: z.coerce.number().default(5),
  HOT_EVENT_VIEW_THRESHOLD: z.coerce.number().default(10),
});

// Parse and validate
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.issues.map((i) => i.path.join('.')).join(', ');
    console.error(`❌ Invalid or missing environment variables: ${missingVars}`);
  } else {
    console.error('❌ Unknown error during environment validation');
  }
  
  // In test environment, don't exit - let tests fail gracefully
  if (!isTestEnv) {
    process.exit(1);
  } else {
    throw new Error('Environment validation failed in test environment');
  }
}

export { env };