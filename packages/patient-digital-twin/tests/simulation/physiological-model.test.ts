import { describe, it, expect } from 'vitest';
import {
  PhysiologicalModelFactory,
  createInitialTwinState,
  createVital,
  MockKafkaClient
} from '../../src';

describe('EWP-009: PhysiologicalModelEngine Trajectory Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('projects a 24-step trajectory forecast and publishes Kafka events', async () => {
    const kafka = new MockKafkaClient();
    const producer = kafka.createProducer();
    const model = PhysiologicalModelFactory.createModel({}, undefined, undefined, producer);

    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 90, unit: 'bpm' });

    const trajectory = await model.projectTrajectory(state, 24, 3600000);

    expect(trajectory.length).toBe(24);
    expect(trajectory[23].version).toBe(25);

    const mockProducer = producer as any;
    expect(mockProducer.producedMessages.length).toBe(1);
    expect(mockProducer.producedMessages[0].topic).toBe('patient.trajectory.projected');
  });
});
