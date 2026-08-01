import { describe, it, expect } from 'vitest';
import {
  PredictiveFeatureVectorSchema,
  ModelMetadataSchema,
  InferenceRequestSchema,
  InferenceResultSchema,
  PAISEngineConfigurationSchema,
  DriftReportSchema,
  UncertaintyEstimateSchema,
  ModelHealthSnapshotSchema,
  ForecastResultSchema,
  NORMALIZATION_BOUNDS,
  FEATURE_DIMENSION_LABELS,
  VALID_STAGE_TRANSITIONS
} from '../../src/predictive/pais-types';

describe('pais-types schemas', () => {
  it('PredictiveFeatureVectorSchema valid/invalid parsing', () => {
    const valid = {
      rawVector: Array.from(new Float64Array(8)),
      normalizedVector: Array.from(new Float64Array(8)),
      hemodynamic: { meanArterialPressure: 90, pulsePressure: 40, shockIndex: 0.6 },
      longitudinal: { heartRateVelocity: 0, bpTrendSlope: 0, spo2Acceleration: 0 },
      timestamp: new Date().toISOString()
    };
    expect(() => PredictiveFeatureVectorSchema.parse(valid)).not.toThrow();

    const invalid = { rawVector: [1, 2] };
    expect(() => PredictiveFeatureVectorSchema.parse(invalid)).toThrow();
  });

  it('ModelMetadataSchema valid/invalid SemVer', () => {
    const valid = {
      modelId: crypto.randomUUID(),
      name: 'test',
      version: '1.0.0',
      domain: 'deterioration',
      stage: 'development',
      accuracyMetrics: { auroc: 0.8 },
      checksum: 'abc',
      inputFeatureCount: 8,
      outputDimensions: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    expect(() => ModelMetadataSchema.parse(valid)).not.toThrow();

    const invalidVersion = { ...valid, version: 'v1' };
    expect(() => ModelMetadataSchema.parse(invalidVersion)).toThrow();
  });

  it('InferenceRequestSchema valid parsing', () => {
    const valid = {
      requestId: crypto.randomUUID(),
      patientId: crypto.randomUUID(),
      features: {
        rawVector: Array.from(new Float64Array(8)),
        normalizedVector: Array.from(new Float64Array(8)),
        hemodynamic: { meanArterialPressure: 90, pulsePressure: 40, shockIndex: 0.6 },
        longitudinal: { heartRateVelocity: 0, bpTrendSlope: 0, spo2Acceleration: 0 },
        timestamp: new Date().toISOString()
      },
      targetHorizonHours: 24
    };
    expect(() => InferenceRequestSchema.parse(valid)).not.toThrow();
  });

  it('InferenceResultSchema valid parsing', () => {
    const valid = {
      requestId: crypto.randomUUID(),
      patientId: crypto.randomUUID(),
      modelId: crypto.randomUUID(),
      predictedRiskScore: 0.5,
      confidenceInterval: { lower: 0.4, upper: 0.6, confidenceLevel: 0.95 },
      executionTimeMs: 10,
      timestamp: new Date().toISOString()
    };
    expect(() => InferenceResultSchema.parse(valid)).not.toThrow();
  });

  it('PAISEngineConfigurationSchema defaults', () => {
    const config = PAISEngineConfigurationSchema.parse({});
    expect(config).toBeDefined();
    expect(config.fallbackThresholds).toBeDefined();
    expect(config.monitorIntervalMs).toBe(60000); // Typical default
  });

  it('DriftReportSchema valid', () => {
    const valid = {
      reportId: crypto.randomUUID(),
      modelId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      featureDriftScores: [{ featureName: 'hr', driftScore: 0.1, metric: 'psi' }],
      overallDriftDetected: false,
      severity: 'none'
    };
    expect(() => DriftReportSchema.parse(valid)).not.toThrow();
  });

  it('UncertaintyEstimateSchema valid', () => {
    const valid = {
      aleatoricUncertainty: 0.1,
      epistemicUncertainty: 0.2,
      totalUncertainty: 0.22,
      isOutOfDistribution: false
    };
    expect(() => UncertaintyEstimateSchema.parse(valid)).not.toThrow();
  });

  it('ModelHealthSnapshotSchema valid', () => {
    const valid = {
      modelId: crypto.randomUUID(),
      totalPredictions: 100,
      fallbackTriggered: 2,
      meanLatencyMs: 15,
      p95LatencyMs: 25,
      errorCount: 0,
      windowStart: new Date().toISOString(),
      windowEnd: new Date().toISOString()
    };
    expect(() => ModelHealthSnapshotSchema.parse(valid)).not.toThrow();
  });

  it('ForecastResultSchema valid', () => {
    const valid = {
      metric: 'heartRate',
      horizonHours: 4,
      points: [{ timestamp: new Date().toISOString(), expectedValue: 80, lowerBound: 75, upperBound: 85 }],
      trend: 'stable'
    };
    expect(() => ForecastResultSchema.parse(valid)).not.toThrow();
  });

  it('NORMALIZATION_BOUNDS length = 8', () => {
    expect(Object.keys(NORMALIZATION_BOUNDS).length).toBe(8);
  });

  it('FEATURE_DIMENSION_LABELS length = 8', () => {
    expect(FEATURE_DIMENSION_LABELS.length).toBe(8);
  });

  it('VALID_STAGE_TRANSITIONS map has all 4 stages', () => {
    expect(VALID_STAGE_TRANSITIONS.has('development')).toBe(true);
    expect(VALID_STAGE_TRANSITIONS.has('staging')).toBe(true);
    expect(VALID_STAGE_TRANSITIONS.has('production')).toBe(true);
    expect(VALID_STAGE_TRANSITIONS.has('deprecated')).toBe(true);
  });
});
