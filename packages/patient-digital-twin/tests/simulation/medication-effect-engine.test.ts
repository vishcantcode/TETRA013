import { describe, it, expect } from 'vitest';
import { MedicationEffectEngine } from '../../src';

describe('EWP-009: MedicationEffectEngine PK/PD Tests', () => {
  it('calculates 1-compartment PK exponential decay concentration', () => {
    // Initial C0 = 100, elapsed = 6h, half-life = 6h -> C(6) = 50
    const conc = MedicationEffectEngine.calculateConcentration(100, 6, 6);
    expect(conc).toBeCloseTo(50.0, 4);
  });

  it('computes Sigmoid Emax pharmacodynamic response', () => {
    // C = 50, EC50 = 50 -> E(t) = 0.5 * Emax
    const e = MedicationEffectEngine.calculateEmaxResponse(50, 1.0, 50, 1.0);
    expect(e).toBeCloseTo(0.5, 4);
  });
});
