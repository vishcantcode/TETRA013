import { describe, it, expect, beforeEach } from 'vitest';
import { ModelMonitor } from '../../src/predictive/model-monitor';
import { InferenceResult } from '../../src/predictive/pais-types';

describe('ModelMonitor', () => {
  let monitor: ModelMonitor;
  let modelId: string;

  beforeEach(() => {
    monitor = new ModelMonitor(60000); // 1 minute window
    modelId = crypto.randomUUID();
  });

  const createResult = (latency: number, fallback = false): InferenceResult => ({
    requestId: crypto.randomUUID(),
    patientId: '1',
    modelId,
    predictedRiskScore: 0.5,
    executionTimeMs: latency,
    fallbackTriggered: fallback,
    timestamp: new Date().toISOString()
  });

  it('recordPrediction() creates window for new model', () => {
    monitor.recordPrediction(createResult(10));
    const snap = monitor.getHealthSnapshot(modelId);
    expect(snap.totalPredictions).toBe(1);
  });

  it('getHealthSnapshot() returns zeros for unknown model', () => {
    const snap = monitor.getHealthSnapshot(crypto.randomUUID());
    expect(snap.totalPredictions).toBe(0);
    expect(snap.meanLatencyMs).toBe(0);
  });

  it('getHealthSnapshot() correctly computes mean latency', () => {
    monitor.recordPrediction(createResult(10));
    monitor.recordPrediction(createResult(20));
    monitor.recordPrediction(createResult(30));
    const snap = monitor.getHealthSnapshot(modelId);
    expect(snap.meanLatencyMs).toBe(20);
  });

  it('getHealthSnapshot() correctly computes P95', () => {
    for (let i = 1; i <= 100; i++) {
      monitor.recordPrediction(createResult(i));
    }
    const snap = monitor.getHealthSnapshot(modelId);
    expect(snap.p95LatencyMs).toBeGreaterThanOrEqual(95);
  });

  it('getHealthSnapshot() counts failures and fallbacks', () => {
    monitor.recordPrediction(createResult(10, true)); // fallback
    monitor.recordError(modelId, new Error('Test'));
    
    const snap = monitor.getHealthSnapshot(modelId);
    expect(snap.fallbackTriggered).toBe(1);
    expect(snap.errorCount).toBe(1);
  });

  it('resetWindow() clears model data', () => {
    monitor.recordPrediction(createResult(10));
    monitor.resetWindow(modelId);
    const snap = monitor.getHealthSnapshot(modelId);
    expect(snap.totalPredictions).toBe(0);
  });
});
