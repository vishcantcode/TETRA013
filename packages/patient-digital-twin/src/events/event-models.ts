import { z } from 'zod';

/**
 * Standardized Event Metadata schema tracking correlation IDs, trace IDs, and timestamps.
 */
export const EventMetadataSchema = z.object({
  eventId: z.string().uuid('Event ID must be a valid UUIDv4'),
  eventType: z.string().min(1, 'Event type is required'),
  source: z.string().min(1, 'Event source is required').default('pdt-service'),
  correlationId: z.string().uuid('Correlation ID must be a valid UUIDv4'),
  traceId: z.string().optional(),
  version: z.number().int().positive().default(1),
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string'),
  tenantId: z.string().default('default')
});
export type EventMetadata = z.infer<typeof EventMetadataSchema>;

/**
 * Generic Event Envelope wrapping event metadata and typed payload.
 */
export function createEventEnvelopeSchema<T extends z.ZodTypeAny>(payloadSchema: T) {
  return z.object({
    metadata: EventMetadataSchema,
    payload: payloadSchema
  });
}

export interface EventEnvelope<T> {
  metadata: EventMetadata;
  payload: T;
}

/**
 * Factory helper function to construct a fully populated EventEnvelope.
 */
export function createEventEnvelope<T>(
  eventType: string,
  payload: T,
  correlationId?: string,
  source: string = 'pdt-service'
): EventEnvelope<T> {
  const now = new Date().toISOString();
  return {
    metadata: {
      eventId: crypto.randomUUID(),
      eventType,
      source,
      correlationId: correlationId || crypto.randomUUID(),
      version: 1,
      timestamp: now,
      tenantId: 'default'
    },
    payload
  };
}
