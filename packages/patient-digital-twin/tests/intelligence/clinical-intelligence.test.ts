import { describe, it, expect } from 'vitest';
import {
  ClinicalIntelligenceEngine,
  createInitialTwinState,
  createVital,
  MockKafkaClient
} from '../../src';

describe('EWP-008: ClinicalIntelligenceEngine Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('processes TwinState and generates deterministic ClinicalSummary', async () => {
    const kafka = new MockKafkaClient();
    const producer = kafka.createProducer();
    const engine = new ClinicalIntelligenceEngine(producer);

    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 140, unit: 'bpm' }); // Critical elevated HR

    const summary = await engine.processState(state);

    expect(summary.patientId).toBe(patientId);
    expect(summary.violations.length).toBe(1);
    expect(summary.violations[0].metric).toBe('heartRate');
    expect(summary.violations[0].level).toBe('critical');

    const mockProducer = producer as any;
    expect(mockProducer.producedMessages.length).toBe(1);
    expect(mockProducer.producedMessages[0].topic).toBe('patient.summary.updated');
  });
});
