import { describe, it, expect } from 'vitest';
import { StabilityEngine, createInitialTwinState, createVital } from '../../src';

describe('EWP-009: StabilityEngine Clinical Classification Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('classifies healthy vitals as "stable"', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 72, unit: 'bpm' });
    state.vitals.bpSystolic = createVital({ patientId, metric: 'bpSystolic', value: 120, unit: 'mmHg' });

    const status = StabilityEngine.classifyStability(state);
    expect(status).toBe('stable');
  });

  it('classifies compromised vitals as "critical"', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 160, unit: 'bpm' });
    state.vitals.bpSystolic = createVital({ patientId, metric: 'bpSystolic', value: 70, unit: 'mmHg' });
    state.vitals.spo2 = createVital({ patientId, metric: 'spo2', value: 85, unit: '%' });

    const status = StabilityEngine.classifyStability(state);
    expect(status).toBe('critical');
  });
});
