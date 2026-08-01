import { describe, it, expect } from 'vitest';
import { createEventEnvelope, EventMetadataSchema } from '../../src';

describe('EWP-006: Event Envelope & Metadata Model Tests', () => {
  it('creates a valid EventEnvelope using factory helper', () => {
    const envelope = createEventEnvelope('patient.vital.ingested', { value: 72 });

    expect(envelope.metadata.eventId).toBeDefined();
    expect(envelope.metadata.eventType).toBe('patient.vital.ingested');
    expect(envelope.metadata.correlationId).toBeDefined();
    expect(envelope.payload).toEqual({ value: 72 });
  });

  it('validates EventMetadataSchema successfully', () => {
    const metadata = EventMetadataSchema.parse({
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'test.event',
      correlationId: '987e6543-e21b-12d3-a456-426614174999',
      timestamp: '2026-07-26T12:00:00.000Z'
    });

    expect(metadata.source).toBe('pdt-service');
    expect(metadata.version).toBe(1);
  });
});
