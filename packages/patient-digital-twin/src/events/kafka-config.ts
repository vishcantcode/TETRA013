import { z } from 'zod';

/**
 * Zod validation schema for Kafka streaming connection configuration.
 */
export const KafkaConfigSchema = z.object({
  brokers: z.array(z.string()).min(1, 'At least one Kafka broker address is required').default(['localhost:9092']),
  clientId: z.string().min(1, 'Client ID is required').default('healthsense-pdt-service'),
  groupId: z.string().min(1, 'Group ID is required').default('pdt-consumer-group'),
  connectionTimeoutMs: z.number().int().positive().default(5000),
  requestTimeoutMs: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(0).default(5),
  dlqSuffix: z.string().default('.dlq')
});
export type KafkaConfig = z.infer<typeof KafkaConfigSchema>;
