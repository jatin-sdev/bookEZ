import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REALTIME_PORT: z.coerce.number().default(4001),
  KAFKA_BROKER: z.string().default('localhost:9092'),
  CORS_ORIGIN: z.string().default('*'),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(`❌ Invalid env vars: ${error.issues.map((i) => i.path.join('.')).join(', ')}`);
  }
  process.exit(1);
}

export { env };