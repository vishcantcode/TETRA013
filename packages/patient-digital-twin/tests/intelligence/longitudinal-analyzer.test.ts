import { describe, it, expect } from 'vitest';
import { LongitudinalAnalyzer, TimeSeriesPoint } from '../../src';

describe('EWP-008: LongitudinalAnalyzer Statistical Tests', () => {
  it('computes rolling statistics accurately', () => {
    const points: TimeSeriesPoint[] = [
      { timestamp: 1000, value: 70 },
      { timestamp: 2000, value: 80 },
      { timestamp: 3000, value: 90 }
    ];

    const stats = LongitudinalAnalyzer.analyzeWindow(points);

    expect(stats.mean).toBe(80);
    expect(stats.median).toBe(80);
    expect(stats.min).toBe(70);
    expect(stats.max).toBe(90);
    expect(stats.slope).toBeGreaterThan(0); // Positive linear trend
    expect(stats.velocity).toBe(10);        // 10 units / sec
  });
});
