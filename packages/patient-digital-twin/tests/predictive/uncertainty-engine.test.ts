import { describe, it, expect } from 'vitest';
import { UncertaintyEngine } from '../../src/predictive/uncertainty-engine';

describe('UncertaintyEngine', () => {
  const normVector = Array.from(new Float64Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]));
  const extremeVector = Array.from(new Float64Array([0.1, 0.9, 0.1, 0.9, 0.1, 0.9, 0.1, 0.9]));

  it('estimateUncertainty() returns valid UncertaintyEstimate', () => {
    const est = UncertaintyEngine.estimateUncertainty(normVector, 0.9);
    expect(est).toBeDefined();
    expect(est.aleatoricUncertainty).toBeDefined();
    expect(est.epistemicUncertainty).toBeDefined();
    expect(est.totalUncertainty).toBeDefined();
    expect(est.isOutOfDistribution).toBeDefined();
  });

  it('estimateUncertainty() aleatoric >= 0', () => {
    const est = UncertaintyEngine.estimateUncertainty(normVector, 0.9);
    expect(est.aleatoricUncertainty).toBeGreaterThanOrEqual(0);
  });

  it('estimateUncertainty() epistemic = 1 - confidence', () => {
    const confidence = 0.85;
    const est = UncertaintyEngine.estimateUncertainty(normVector, confidence);
    expect(est.epistemicUncertainty).toBeCloseTo(1 - confidence, 4);
  });

  it('estimateUncertainty() totalUncertainty = sqrt(a² + e²)', () => {
    const est = UncertaintyEngine.estimateUncertainty(normVector, 0.9);
    const expectedTotal = Math.sqrt(
      Math.pow(est.aleatoricUncertainty, 2) + Math.pow(est.epistemicUncertainty, 2)
    );
    expect(est.totalUncertainty).toBeCloseTo(expectedTotal, 4);
  });

  it('estimateUncertainty() isOutOfDistribution true for extreme features', () => {
    const est = UncertaintyEngine.estimateUncertainty(extremeVector, 0.5);
    expect(est.isOutOfDistribution).toBe(true);
  });

  it('computeConfidenceInterval() lower <= riskScore <= upper', () => {
    const risk = 0.5;
    const est = UncertaintyEngine.estimateUncertainty(normVector, 0.9);
    const ci = UncertaintyEngine.computeConfidenceInterval(risk, est, 0.95);
    expect(ci.lower).toBeLessThanOrEqual(risk);
    expect(ci.upper).toBeGreaterThanOrEqual(risk);
  });

  it('computeConfidenceInterval() bounds clamped to [0,1]', () => {
    const est = UncertaintyEngine.estimateUncertainty(normVector, 0.5);
    const ciHigh = UncertaintyEngine.computeConfidenceInterval(0.99, est, 0.95);
    expect(ciHigh.upper).toBe(1.0);

    const ciLow = UncertaintyEngine.computeConfidenceInterval(0.01, est, 0.95);
    expect(ciLow.lower).toBe(0.0);
  });
});
