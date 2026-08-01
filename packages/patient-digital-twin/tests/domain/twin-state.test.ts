import { describe, it, expect } from 'vitest';
import {
  TwinSyncStatusSchema,
  TwinStateSchema,
  createInitialTwinState,
  serializeTwinState,
  deserializeTwinState,
  toStateVector,
  validateTwinState,
  parseTwinState,
  createVital,
  createRiskScore
} from '../../src/domain';

describe('EWP-002: TwinState & Vector Utilities', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('validates TwinSyncStatusSchema', () => {
    expect(TwinSyncStatusSchema.parse('initialized')).toBe('initialized');
    expect(TwinSyncStatusSchema.parse('steady')).toBe('steady');
    expect(TwinSyncStatusSchema.parse('stale')).toBe('stale');
    expect(() => TwinSyncStatusSchema.parse('offline')).toThrow();
  });

  it('creates a valid default initial TwinState via createInitialTwinState factory', () => {
    const state = createInitialTwinState(validPatientId);

    expect(state.patientId).toBe(validPatientId);
    expect(state.version).toBe(1);
    expect(state.status).toBe('initialized');
    expect(state.vitals).toEqual({});
    expect(state.biomarkers).toEqual({});
    expect(state.medications).toEqual([]);
    expect(state.riskScores).toEqual({});
    expect(state.conditions).toEqual([]);
    expect(state.lastTimestamp).toBeDefined();
  });

  it('serializes and deserializes TwinState accurately without data loss', () => {
    const initialState = createInitialTwinState(validPatientId);
    initialState.vitals['heartRate'] = createVital({
      patientId: validPatientId,
      metric: 'heartRate',
      value: 78,
      unit: 'bpm'
    });

    const json = serializeTwinState(initialState);
    expect(typeof json).toBe('string');

    const restored = deserializeTwinState(json);
    expect(restored.patientId).toBe(validPatientId);
    expect(restored.vitals['heartRate']?.value).toBe(78);
  });

  it('converts TwinState into a high-performance Float64Array state vector', () => {
    const state = createInitialTwinState(validPatientId);
    state.vitals['heartRate'] = createVital({
      patientId: validPatientId,
      metric: 'heartRate',
      value: 72,
      unit: 'bpm'
    });
    state.vitals['bpSystolic'] = createVital({
      patientId: validPatientId,
      metric: 'bpSystolic',
      value: 124,
      unit: 'mmHg'
    });
    state.riskScores['sepsisNEWS2'] = createRiskScore({
      patientId: validPatientId,
      riskType: 'sepsisNEWS2',
      score: 0.15
    });

    const vector = toStateVector(state);
    expect(vector).toBeInstanceOf(Float64Array);
    expect(vector.length).toBe(8);
    expect(vector[0]).toBe(72);  // heartRate
    expect(vector[1]).toBe(124); // bpSystolic
    expect(vector[7]).toBe(0.15); // sepsisNEWS2
  });
});
