import { describe, it, expect } from 'vitest';
import { DriftDetector } from '../../src/predictive/drift-detector';

describe('DriftDetector', () => {
  it('buildHistogram() returns correct bin count', () => {
    const data = [0.1, 0.2, 0.5, 0.8, 0.9];
    const bins = DriftDetector.buildHistogram(data, 10);
    expect(bins.length).toBe(10);
  });

  it('buildHistogram() sums to approximately 1.0', () => {
    const data = [0.1, 0.2, 0.5, 0.8, 0.9];
    const bins = DriftDetector.buildHistogram(data, 10);
    const sum = bins.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 4);
  });

  it('computePSI() returns 0 for identical distributions', () => {
    const data = [0.1, 0.2, 0.5, 0.8, 0.9];
    const refBins = DriftDetector.buildHistogram(data, 10);
    const actBins = DriftDetector.buildHistogram(data, 10);
    const psi = DriftDetector.computePSI(refBins, actBins);
    expect(psi).toBe(0);
  });

  it('computePSI() returns > 0 for different distributions', () => {
    const refData = [0.1, 0.1, 0.2, 0.2];
    const actData = [0.8, 0.8, 0.9, 0.9];
    const refBins = DriftDetector.buildHistogram(refData, 10);
    const actBins = DriftDetector.buildHistogram(actData, 10);
    const psi = DriftDetector.computePSI(refBins, actBins);
    expect(psi).toBeGreaterThan(0);
  });

  it('computeKSStatistic() returns 0 for identical arrays', () => {
    const arr = [0.1, 0.2, 0.3];
    const ks = DriftDetector.computeKSStatistic(arr, arr);
    expect(ks).toBe(0);
  });

  it('computeKSStatistic() returns 1.0 for fully separated distributions', () => {
    const refArr = [0.1, 0.2, 0.3];
    const actArr = [0.7, 0.8, 0.9];
    const ks = DriftDetector.computeKSStatistic(refArr, actArr);
    expect(ks).toBe(1.0);
  });

  it('isDrifting() returns true when PSI exceeds threshold', () => {
    const drifting = DriftDetector.isDrifting(0.3, 0.1);
    expect(drifting).toBe(true);
  });

  it('evaluateDrift() returns valid DriftReport', () => {
    const modelId = crypto.randomUUID();
    const refData = Array(100).fill(0).map(() => Math.random());
    const actData = Array(100).fill(0).map(() => Math.random() * 0.5); // shift distribution
    
    const report = DriftDetector.evaluateDrift(modelId, [refData], [actData], ['feature0']);
    expect(report.modelId).toBe(modelId);
    expect(report.featureDriftScores.length).toBe(1);
    expect(report.featureDriftScores[0].featureName).toBe('feature0');
  });

  it('evaluateDrift() severity classification correct', () => {
    const modelId = crypto.randomUUID();
    // Simulate massive drift
    const refData = Array(100).fill(0.1);
    const actData = Array(100).fill(0.9);
    
    const report = DriftDetector.evaluateDrift(modelId, [refData], [actData], ['feature0']);
    expect(report.overallDriftDetected).toBe(true);
    expect(report.severity).toBe('critical'); // High PSI -> critical
  });
});
