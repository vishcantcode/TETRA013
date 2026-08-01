import { describe, it, expect } from 'vitest';
import { DependencyGraphEngine } from '../../src';

describe('EWP-009: DependencyGraphEngine Matrix Multiplication Tests', () => {
  it('computes 14x14 cross-domain influence vector Y = W * S', () => {
    const stateVec = new Float64Array(14);
    stateVec[0] = 0.8; // High cardiovascular stress
    stateVec[1] = 0.5; // Respiratory

    const out = DependencyGraphEngine.computeInfluenceVector(stateVec);

    expect(out).toBeInstanceOf(Float64Array);
    expect(out.length).toBe(14);
    expect(out[1]).toBeGreaterThan(0); // Cardio influences Resp (row 1)
  });
});
