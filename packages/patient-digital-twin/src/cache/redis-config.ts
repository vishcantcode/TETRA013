import { z } from 'zod';

/**
 * Zod validation schema for Redis client configuration.
 */
export const RedisConfigSchema = z.object({
  host: z.string().min(1, 'Host is required').default('localhost'),
  port: z.number().int().positive().default(6379),
  password: z.string().optional(),
  db: z.number().int().min(0).default(0),
  tls: z.boolean().default(false),
  connectTimeoutMs: z.number().int().positive().default(5000),
  defaultTtlSeconds: z.number().int().positive().default(259200), // 72 hours
  vitalsTtlSeconds: z.number().int().positive().default(300), // 5 minutes
  maxRetriesPerRequest: z.number().int().min(0).default(3)
});
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
