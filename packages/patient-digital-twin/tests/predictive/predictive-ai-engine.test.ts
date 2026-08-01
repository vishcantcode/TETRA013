import { describe, it, expect, beforeEach } from 'vitest';
import { PredictiveAIEngine } from '../../src/predictive/predictive-ai-engine';
import { TwinState } from '../../src/domain/twin-state';

function createTestTwinState(): TwinState {
  const patientId = '00000000-0000-4000-8000-000000000001';
  const now = new Date().toISOString();
  return {
    patientId,
    version: 1,
    status: 'steady',
    vitals: {
      heartRate: { metric: 'heartRate', value: 75, unit: 'bpm', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      bpSystolic: { metric: 'bpSystolic', value: 120, unit: 'mmHg', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      bpDiastolic: { metric: 'bpDiastolic', value: 80, unit: 'mmHg', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      spo2: { metric: 'spo2', value: 98, unit: '%', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      respiratoryRate: { metric: 'respiratoryRate', value: 16, unit: 'breaths/min', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      temperature: { metric: 'temperature', value: 36.8, unit: 'degC', confidence: 1.0, halfLifeMs: 300000, timestamp: now },
      glucose: { metric: 'glucose', value: 100, unit: 'mg/dL', confidence: 1.0, halfLifeMs: 300000, timestamp: now }
    },
    biomarkers: {},
    medications: [],
    riskScores: {},
    conditions: [],
    lastTimestamp: now
  };
}

describe('PredictiveAIEngine', () => {
  let engine: PredictiveAIEngine;

  beforeEach(() => {
    engine = new PredictiveAIEngine();
    // Register a dummy production model for tests
    engine.modelRegistry.registerModel({
      modelId: crypto.randomUUID(),
      name: 'integration-test-model',
      version: '1.0.0',
      domain: 'deterioration',
      stage: 'production',
      accuracyMetrics: { auroc: 0.9, f1Score: 0.85 },
      checksum: '123',
      inputFeatureCount: 8,
      outputDimensions: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it('executePrediction() returns valid InferenceResult', async () => {
    const state = createTestTwinState();
    const res = await engine.executePrediction(state, [state], 'deterioration', 24);
    expect(res).toBeDefined();
    expect(res.predictedRiskScore).toBeGreaterThanOrEqual(0);
  });

  it('executePrediction() result has explanation with traceId', async () => {
    const state = createTestTwinState();
    const res = await engine.executePrediction(state, [], 'deterioration', 24);
    expect(res.explanation).toBeDefined();
    expect(res.explanation?.traceId).toBeDefined();
  });

  it('executePrediction() result has confidenceInterval', async () => {
    const state = createTestTwinState();
    const res = await engine.executePrediction(state, [], 'deterioration', 24);
    expect(res.confidenceInterval).toBeDefined();
  });

  it('executeBatchPrediction() processes all states', async () => {
    const states = [createTestTwinState(), createTestTwinState()];
    const results = await engine.executeBatchPrediction(states, 'deterioration', 24);
    expect(results.length).toBe(2);
  });

  it('executeForecasts() returns forecasts for requested metrics', async () => {
    const state = createTestTwinState();
    const metrics = ['heartRate', 'spo2'];
    const forecasts = await engine.executeForecasts([state, state], metrics, 4);
    expect(forecasts.length).toBe(2);
    expect(forecasts.map(f => f.metric)).toEqual(expect.arrayContaining(metrics));
  });

  it('All subsystem accessors are available (featurePipeline, modelRegistry, etc)', () => {
    expect(engine.featureExtraction).toBeDefined();
    expect(engine.modelRegistry).toBeDefined();
    expect(engine.inferenceEngine).toBeDefined();
    expect(engine.monitor).toBeDefined();
  });
});
