import { describe, it, expect } from 'vitest';
import { KafkaConfigSchema, PatientTwinTopics, getDlqTopic } from '../../src';

describe('EWP-006: Kafka Config & Topic Verification', () => {
  it('validates KafkaConfigSchema defaults', () => {
    const config = KafkaConfigSchema.parse({});
    expect(config.brokers).toEqual(['localhost:9092']);
    expect(config.clientId).toBe('healthsense-pdt-service');
    expect(config.groupId).toBe('pdt-consumer-group');
    expect(config.dlqSuffix).toBe('.dlq');
  });

  it('generates correct DLQ topic names', () => {
    const dlq = getDlqTopic(PatientTwinTopics.PATIENT_VITAL_INGESTED);
    expect(dlq).toBe('patient.vital.ingested.dlq');
  });
});
