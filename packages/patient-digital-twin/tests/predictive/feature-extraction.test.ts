import { describe, it, expect } from 'vitest';
import { FeatureExtractionEngine } from '../../src/predictive/feature-extraction-engine';
import { TwinState } from '../../src/domain/twin-state';
import { NORMALIZATION_BOUNDS } from '../../src/predictive/pais-types';

function createTestTwinState(overrides?: Partial<{ hr: number; sbp: number; dbp: number; spo2: number; rr: number; temp: number; glucose: number; risk: number }>): TwinState {
  const patientId = '00000000-0000-4000-8000-000000000001';
  const now = new Date().toISOString();
  const hr = overrides?.hr ?? 75;
  const sbp = overrides?.sbp ?? 120;
  const dbp = overrides?.dbp ?? 80;
  const spo2 = overrides?.spo2 ?? 98;
  const rr = overrides?.rr ?? 16;
  const temp = overrides?.temp ?? 36.8;
  const glucose = overrides?.glucose ?? 100;
  const risk = overrides?.risk ?? 0.2;
  return {
    patientId,
    version: 1,
    status: 'steady',
    vitals: {
      heartRate: { metric: 'heartRate', value: hr, unit: 'bpm', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      bpSystolic: { metric: 'bpSystolic', value: sbp, unit: 'mmHg', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      bpDiastolic: { metric: 'bpDiastolic', value: dbp, unit: 'mmHg', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      spo2: { metric: 'spo2', value: spo2, unit: '%', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      respiratoryRate: { metric: 'respiratoryRate', value: rr, unit: 'breaths/min', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      temperature: { metric: 'temperature', value: temp, unit: 'degC', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      glucose: { metric: 'glucose', value: glucose, unit: 'mg/dL', confidence: 1.0, halfLifeMs: 300000, timestamp: now }
    },
    biomarkers: {},
    medications: [],
    riskScores: { sepsisNEWS2: { riskType: 'sepsisNEWS2', score: risk, trend: 'stable', confidence: 1.0, evidenceIds: [], timestamp: now } },
    conditions: [],
    lastTimestamp: now
  };
}

describe('FeatureExtractionEngine', () => {
  it('normalize() clamps correctly: below min → 0, above max → 1, midpoint → 0.5-ish', () => {
    expect(FeatureExtractionEngine.normalize(10, 20, 100)).toBe(0); // below min
    expect(FeatureExtractionEngine.normalize(150, 20, 100)).toBe(1); // above max
    expect(FeatureExtractionEngine.normalize(60, 20, 100)).toBe(0.5); // midpoint
  });

  it('extractRawVector() returns Float64Array of length 8', () => {
    const state = createTestTwinState();
    const vec = FeatureExtractionEngine.extractRawVector(state);
    expect(vec).toBeInstanceOf(Float64Array);
    expect(vec.length).toBe(8);
  });

  it('extractRawVector() normalizes HR 75 to (75-30)/(220-30) ≈ 0.2368', () => {
    const state = createTestTwinState({ hr: 75 });
    const raw = FeatureExtractionEngine.extractRawVector(state);
    const bounds = NORMALIZATION_BOUNDS['heartRate'];
    const expected = (75 - bounds.min) / (bounds.max - bounds.min);
    
    const normalized = FeatureExtractionEngine.normalizeVector(raw);
    expect(normalized[0]).toBeCloseTo(expected, 4);
  });

  it('extractRawVector() with pre-allocated buffer reuses it (zero-allocation)', () => {
    const state = createTestTwinState();
    const buffer = new Float64Array(8);
    const vec = FeatureExtractionEngine.extractRawVector(state, buffer);
    expect(vec).toBe(buffer);
  });

  it('computeHemodynamicFeatures() MAP = 80 + (1/3)(120 - 80) ≈ 93.33', () => {
    const res = FeatureExtractionEngine.computeHemodynamicFeatures(120, 80, 75);
    expect(res.meanArterialPressure).toBeCloseTo(93.33, 2);
  });

  it('computeHemodynamicFeatures() PP = 120 - 80 = 40', () => {
    const res = FeatureExtractionEngine.computeHemodynamicFeatures(120, 80, 75);
    expect(res.pulsePressure).toBe(40);
  });

  it('computeHemodynamicFeatures() SI = 75/120 = 0.625', () => {
    const res = FeatureExtractionEngine.computeHemodynamicFeatures(120, 80, 75);
    expect(res.shockIndex).toBeCloseTo(0.625, 3);
  });

  it('computeHemodynamicFeatures() division-by-zero guard (SBP=0 → SI=0)', () => {
    const res = FeatureExtractionEngine.computeHemodynamicFeatures(0, 80, 75);
    expect(res.shockIndex).toBe(0);
  });

  it('extractFeatures() returns complete PredictiveFeatureVector', () => {
    const state = createTestTwinState();
    const engine = new FeatureExtractionEngine();
    const features = engine.extractFeatures(state);
    expect(features.rawVector.length).toBe(8);
    expect(features.normalizedVector.length).toBe(8);
    expect(features.hemodynamic).toBeDefined();
    expect(features.longitudinal).toBeDefined();
    expect(features.timestamp).toBeDefined();
  });

  it('extractFeatures() with history computes longitudinal stats', () => {
    const state = createTestTwinState();
    const stateOld = createTestTwinState({ hr: 60 });
    const engine = new FeatureExtractionEngine();
    const features = engine.extractFeatures(state, [stateOld, state]);
    expect(features.longitudinal).toBeDefined();
  });
});
