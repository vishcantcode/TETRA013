import { describe, it, expect } from 'vitest';
import {
  ClinicalDecisionFactory,
  createInitialTwinState,
  createVital,
  MockKafkaClient
} from '../../src';

describe('EWP-011: ClinicalDecisionEngine Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('evaluates decision candidates and publishes patient.decision.evaluated event', async () => {
    const kafka = new MockKafkaClient();
    const producer = kafka.createProducer();
    const engine = ClinicalDecisionFactory.createEngine({}, undefined, undefined, producer);

    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 75, unit: 'bpm' });
    state.vitals.bpSystolic = createVital({ patientId, metric: 'bpSystolic', value: 120, unit: 'mmHg' });

    const result = await engine.evaluateDecisions(state);

    expect(result.patientId).toBe(patientId);
    expect(result.rankedCandidates.length).toBeGreaterThan(0);
    expect(result.explanation.decisionTraceId).toBe(result.decisionTraceId);

    const mockProducer = producer as any;
    expect(mockProducer.producedMessages.length).toBe(2);
    expect(mockProducer.producedMessages[0].topic).toBe('patient.decision.evaluated');
  });
});
