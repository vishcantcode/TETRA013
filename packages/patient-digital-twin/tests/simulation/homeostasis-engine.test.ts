import { describe, it, expect } from 'vitest';
import { HomeostasisEngine } from '../../src';

describe('EWP-009: HomeostasisEngine Restoration Vector Tests', () => {
  it('calculates homeostatic restoration pull toward baseline', () => {
    const current = new Float64Array([0.8, 0.5]);
    const baseline = new Float64Array([0.5, 0.5]);

    const restoration = HomeostasisEngine.computeHomeostaticRestoration(current, baseline, 0.0, 0.1);

    // Skewed state (0.8 > 0.5) experiences negative restoration (-kappa * 0.3)
    expect(restoration[0]).toBeLessThan(0);
    expect(Math.abs(restoration[1])).toBe(0); // Baseline equal -> 0 restoration
  });
});
