import { describe, it, expect } from 'vitest';
import { LongitudinalFeatureEngine } from '../../src/predictive/longitudinal-feature-engine';

describe('LongitudinalFeatureEngine', () => {
  it('computeOLSSlope() with 2 points → exact slope', () => {
    const times = new Float64Array([0, 1]);
    const values = new Float64Array([10, 20]);
    const slope = LongitudinalFeatureEngine.computeOLSSlope(times, values);
    expect(slope).toBeCloseTo(10, 4);
  });

  it('computeOLSSlope() with < 2 points → 0', () => {
    const times = new Float64Array([0]);
    const values = new Float64Array([10]);
    const slope = LongitudinalFeatureEngine.computeOLSSlope(times, values);
    expect(slope).toBe(0);
  });

  it('computeOLSSlope() with flat line → 0', () => {
    const times = new Float64Array([0, 1, 2]);
    const values = new Float64Array([10, 10, 10]);
    const slope = LongitudinalFeatureEngine.computeOLSSlope(times, values);
    expect(slope).toBe(0);
  });

  it('computeOLSSlope() with 3 ascending points', () => {
    const times = new Float64Array([0, 1, 2]);
    const values = new Float64Array([10, 20, 30]);
    const slope = LongitudinalFeatureEngine.computeOLSSlope(times, values);
    expect(slope).toBeCloseTo(10, 4);
  });

  it('computeVelocity() with 2 points → correct rate', () => {
    const p1 = { timestamp: 0, value: 10 };
    const p2 = { timestamp: 1000, value: 20 };
    const v = LongitudinalFeatureEngine.computeVelocity(p1, p2);
    expect(v).toBeCloseTo(0.01, 4); // (20-10) / (1000-0)
  });

  it('computeVelocity() with < 2 points → 0', () => {
    expect(LongitudinalFeatureEngine.computeVelocity({timestamp: 0, value: 10}, undefined as unknown as {timestamp: number, value: number})).toBe(0);
  });

  it('computeAcceleration() with 3 points → correct acceleration', () => {
    const p1 = { timestamp: 0, value: 0 };
    const p2 = { timestamp: 1000, value: 10 };
    const p3 = { timestamp: 2000, value: 40 };
    const acc = LongitudinalFeatureEngine.computeAcceleration(p1, p2, p3);
    // v1 = 10/1000 = 0.01, v2 = 30/1000 = 0.03. acc = (0.03 - 0.01) / 1000 = 0.00002
    expect(acc).toBeCloseTo(0.00002, 6);
  });

  it('computeAcceleration() with < 3 points → 0', () => {
    expect(LongitudinalFeatureEngine.computeAcceleration({timestamp: 0, value: 0}, {timestamp: 1000, value: 10}, undefined as unknown as {timestamp: number, value: number})).toBe(0);
  });

  it('extractTimeSeriesFromHistory() extracts heartRate correctly', () => {
    const history = [
      { vitals: { heartRate: { value: 70, timestamp: '2023-01-01T00:00:00Z' } } },
      { vitals: { heartRate: { value: 75, timestamp: '2023-01-01T00:01:00Z' } } }
    ] as unknown as import('../../src/domain/twin-state').TwinState[];
    const series = LongitudinalFeatureEngine.extractTimeSeriesFromHistory(history, 'heartRate');
    expect(series.length).toBe(2);
    expect(series[0].value).toBe(70);
  });

  it('computeWindowStats() returns all 3 stats', () => {
    const series = [
      { timestamp: 0, value: 10 },
      { timestamp: 1000, value: 20 },
      { timestamp: 2000, value: 30 }
    ];
    const stats = LongitudinalFeatureEngine.computeWindowStats(series);
    expect(stats.mean).toBe(20);
    expect(stats.variance).toBeDefined();
    expect(stats.slope).toBeCloseTo(0.01, 4);
  });
});
