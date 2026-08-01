import { describe, it, expect } from 'vitest';
import { StateVectorEngine, createInitialTwinState, createVital } from '../../src';

describe('EWP-007: StateVectorEngine Normalization & Mapping Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('normalizes Heart Rate (30..220) accurately', () => {
    expect(StateVectorEngine.normalize(30, 30, 220)).toBe(0.0);
    expect(StateVectorEngine.normalize(220, 30, 220)).toBe(1.0);
    expect(StateVectorEngine.normalize(125, 30, 220)).toBe(0.5);
  });

  it('clamps out-of-bounds values strictly to [0.0, 1.0]', () => {
    expect(StateVectorEngine.normalize(10, 30, 220)).toBe(0.0);
    expect(StateVectorEngine.normalize(300, 30, 220)).toBe(1.0);
  });

  it('extracts canonical Float64Array(8) with correct DSCS index mapping', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 125, unit: 'bpm' });
    state.vitals.spo2 = createVital({ patientId, metric: 'spo2', value: 100, unit: '%' });

    const rawVector = StateVectorEngine.extractRawFloat64Vector(state);

    expect(rawVector).toBeInstanceOf(Float64Array);
    expect(rawVector.length).toBe(8);
    expect(rawVector[0]).toBe(0.5); // Heart Rate 125 bpm -> 0.5
    expect(rawVector[3]).toBe(1.0); // SpO2 100% -> 1.0
  });

  it('extracts TwinStateVector envelope and supports pre-allocated buffer extraction', () => {
    const state = createInitialTwinState(patientId);
    const reusableBuffer = new Float64Array(8);

    const raw = StateVectorEngine.extractRawFloat64Vector(state, reusableBuffer);
    expect(raw).toBe(reusableBuffer);

    const vectorEnvelope = StateVectorEngine.extractVector(state);
    expect(vectorEnvelope.patientId).toBe(patientId);
    expect(vectorEnvelope.vectorValues.length).toBe(8);
  });
});
