import { describe, it, expect } from 'vitest';
import { FallbackRuleEngine } from '../../src/predictive/fallback-rule-engine';
import { InferenceRequest } from '../../src/predictive/pais-types';

describe('FallbackRuleEngine', () => {
  const createRequest = (features: number[]): InferenceRequest => ({
    requestId: crypto.randomUUID(),
    patientId: '00000000-0000-4000-8000-000000000001',
    features: {
      rawVector: features,
      normalizedVector: Array.from(new Float64Array(8)),
      hemodynamic: { meanArterialPressure: 90, pulsePressure: 40, shockIndex: 0.6 },
      longitudinal: { heartRateVelocity: 0, bpTrendSlope: 0, spo2Acceleration: 0 },
      timestamp: new Date().toISOString()
    },
    targetHorizonHours: 24
  });

  it('computeDeterministicRisk() returns value in [0,1]', () => {
    const req = createRequest([75, 120, 80, 98, 16, 37, 100, 0]);
    const risk = FallbackRuleEngine.computeDeterministicRisk(req.features);
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(1);
  });

  it('computeDeterministicRisk() SpO2 inversion works (high SpO2 → lower risk)', () => {
    const reqHighSpo2 = createRequest([75, 120, 80, 99, 16, 37, 100, 0]);
    const riskLow = FallbackRuleEngine.computeDeterministicRisk(reqHighSpo2.features);
    
    const reqLowSpo2 = createRequest([75, 120, 80, 85, 16, 37, 100, 0]);
    const riskHigh = FallbackRuleEngine.computeDeterministicRisk(reqLowSpo2.features);
    
    expect(riskHigh).toBeGreaterThan(riskLow);
  });

  it('countThresholdViolations() returns 0 for normal vitals', () => {
    const req = createRequest([75, 120, 80, 98, 16, 37, 100, 0]);
    const violations = FallbackRuleEngine.countThresholdViolations(req.features);
    expect(violations).toBe(0);
  });

  it('countThresholdViolations() returns > 0 for extreme vitals', () => {
    const req = createRequest([150, 70, 40, 88, 30, 39.5, 300, 0]);
    const violations = FallbackRuleEngine.countThresholdViolations(req.features);
    expect(violations).toBeGreaterThan(0);
  });

  it('computeDeteriorationProbability() returns violations/8', () => {
    const req = createRequest([150, 70, 40, 88, 30, 39.5, 300, 0]);
    const violations = FallbackRuleEngine.countThresholdViolations(req.features);
    const prob = FallbackRuleEngine.computeDeteriorationProbability(req.features);
    expect(prob).toBeCloseTo(violations / 8, 4);
  });

  it('generateFallbackResult() has fallbackTriggered = true', () => {
    const req = createRequest([75, 120, 80, 98, 16, 37, 100, 0]);
    const res = FallbackRuleEngine.generateFallbackResult(req, new Error('Test timeout'));
    expect(res.fallbackTriggered).toBe(true);
  });

  it('generateFallbackResult() returns complete InferenceResult', () => {
    const req = createRequest([75, 120, 80, 98, 16, 37, 100, 0]);
    const res = FallbackRuleEngine.generateFallbackResult(req, new Error('Model failed'));
    expect(res.requestId).toBe(req.requestId);
    expect(res.patientId).toBe(req.patientId);
    expect(res.predictedRiskScore).toBeGreaterThanOrEqual(0);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
