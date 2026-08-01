import { describe, it, expect } from 'vitest';
import { FeatureExtractor, createInitialTwinState, createVital } from '../../src';

describe('EWP-008: FeatureExtractor Hemodynamic Calculation Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('calculates Mean Arterial Pressure (MAP), Pulse Pressure (PP), and Shock Index (SI)', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 100, unit: 'bpm' });
    state.vitals.bpSystolic = createVital({ patientId, metric: 'bpSystolic', value: 120, unit: 'mmHg' });
    state.vitals.bpDiastolic = createVital({ patientId, metric: 'bpDiastolic', value: 80, unit: 'mmHg' });

    const features = FeatureExtractor.extractFeatures(state);

    // MAP = 80 + 1/3 (120 - 80) = 80 + 13.33 = 93.33
    expect(features.meanArterialPressure).toBeCloseTo(93.33, 1);
    // PP = 120 - 80 = 40
    expect(features.pulsePressure).toBe(40);
    // SI = 100 / 120 = 0.833
    expect(features.shockIndex).toBeCloseTo(0.833, 2);
  });
});
