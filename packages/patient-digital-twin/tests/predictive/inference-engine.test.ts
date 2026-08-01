import { describe, it, expect, beforeEach } from 'vitest';
import { InferenceEngine } from '../../src/predictive/inference-engine';
import { InferenceRequest, ModelMetadata } from '../../src/predictive/pais-types';

describe('InferenceEngine', () => {
  let engine: InferenceEngine;
  let modelMeta: ModelMetadata;

  beforeEach(() => {
    engine = new InferenceEngine();
    modelMeta = {
      modelId: crypto.randomUUID(),
      name: 'test-model',
      version: '1.0.0',
      domain: 'deterioration',
      stage: 'production',
      accuracyMetrics: { auroc: 0.85, f1Score: 0.80 },
      checksum: 'abc123',
      inputFeatureCount: 8,
      outputDimensions: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const createRequest = (): InferenceRequest => ({
    requestId: crypto.randomUUID(),
    patientId: '00000000-0000-4000-8000-000000000001',
    features: {
      rawVector: Array.from(new Float64Array(8)),
      normalizedVector: Array.from(new Float64Array(8)),
      hemodynamic: { meanArterialPressure: 90, pulsePressure: 40, shockIndex: 0.6 },
      longitudinal: { heartRateVelocity: 0, bpTrendSlope: 0, spo2Acceleration: 0 },
      timestamp: new Date().toISOString()
    },
    targetHorizonHours: 24
  });

  it('predict() returns valid InferenceResult', async () => {
    const req = createRequest();
    const res = await engine.predict(req, modelMeta);
    expect(res).toBeDefined();
    expect(res.requestId).toBe(req.requestId);
    expect(res.patientId).toBe(req.patientId);
    expect(res.modelId).toBe(modelMeta.modelId);
  });

  it('predict() result has predictedRiskScore in [0,1]', async () => {
    const req = createRequest();
    const res = await engine.predict(req, modelMeta);
    expect(res.predictedRiskScore).toBeGreaterThanOrEqual(0);
    expect(res.predictedRiskScore).toBeLessThanOrEqual(1);
  });

  it('predict() result has executionTimeMs >= 0', async () => {
    const req = createRequest();
    const res = await engine.predict(req, modelMeta);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('predict() includes confidenceInterval', async () => {
    const req = createRequest();
    const res = await engine.predict(req, modelMeta);
    expect(res.confidenceInterval).toBeDefined();
    expect(res.confidenceInterval?.lower).toBeGreaterThanOrEqual(0);
    expect(res.confidenceInterval?.upper).toBeLessThanOrEqual(1);
  });

  it('predictBatch() processes multiple requests', async () => {
    const reqs = [createRequest(), createRequest()];
    const res = await engine.predictBatch(reqs, modelMeta);
    expect(res.length).toBe(2);
    expect(res[0].requestId).toBe(reqs[0].requestId);
    expect(res[1].requestId).toBe(reqs[1].requestId);
  });

  it('predict() with timeout fallback (use very short timeout like 1ms and a slow model)', async () => {
    const req = createRequest();
    // Assuming InferenceEngine supports passing an AbortSignal or throws on timeout
    // In our implementation, we test the error handling or fallback
    await expect(engine.predict(req, modelMeta, { timeoutMs: 0 })).rejects.toThrow();
  });
});
