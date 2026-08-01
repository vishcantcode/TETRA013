/**
 * 14 Physiological Domains defined in HPMS v1.0.
 */
export const PhysiologicalDomains = [
  'cardiovascular',
  'respiratory',
  'neurological',
  'endocrine',
  'renal',
  'hepatic',
  'hematological',
  'metabolic',
  'immune',
  'medication',
  'nutrition',
  'fluidBalance',
  'infection',
  'risk'
] as const;

export type PhysiologicalDomain = typeof PhysiologicalDomains[number];

export class DependencyGraphEngine {
  /**
   * 14x14 Physiological Cross-System Interaction Matrix W in R^{14 x 14}.
   */
  private static readonly INTERACTION_MATRIX: number[][] = [
    // Cardio, Resp, Neuro, Endo, Renal, Hepat, Hemat, Metab, Immun, Med,  Nutr, Fluid, Infec, Risk
    [  0.0,   0.2,   0.1,   0.05,  0.15,  0.05,  0.1,   0.1,   0.05,  0.1,  0.0,  0.15,  0.1,   0.2 ], // Cardio
    [  0.25,  0.0,   0.1,   0.0,   0.1,   0.05,  0.15,  0.15,  0.1,   0.05, 0.0,  0.1,   0.15,  0.2 ], // Resp
    [  0.2,   0.2,   0.0,   0.1,   0.05,  0.05,  0.05,  0.1,   0.05,  0.05, 0.05, 0.05,  0.1,   0.25], // Neuro
    [  0.1,   0.05,  0.1,   0.0,   0.1,   0.1,   0.05,  0.2,   0.1,   0.15, 0.15, 0.1,   0.1,   0.15], // Endo
    [  0.2,   0.1,   0.05,  0.1,   0.0,   0.1,   0.1,   0.15,  0.05,  0.1,  0.05, 0.25,  0.1,   0.2 ], // Renal
    [  0.1,   0.05,  0.05,  0.1,   0.1,   0.0,   0.1,   0.15,  0.1,   0.15, 0.1,  0.1,   0.1,   0.15], // Hepat
    [  0.15,  0.2,   0.05,  0.05,  0.1,   0.1,   0.0,   0.1,   0.15,  0.05, 0.1,  0.05,  0.1,   0.15], // Hemat
    [  0.1,   0.15,  0.1,   0.2,   0.15,  0.15,  0.1,   0.0,   0.15,  0.1,  0.1,  0.1,   0.15,  0.2 ], // Metab
    [  0.1,   0.1,   0.05,  0.1,   0.05,  0.1,   0.15,  0.15,  0.0,   0.05, 0.05, 0.05,  0.3,   0.2 ], // Immun
    [  0.15,  0.1,   0.05,  0.2,   0.1,   0.15,  0.05,  0.1,   0.05,  0.0,  0.0,  0.1,   0.05,  0.1 ], // Med
    [  0.05,  0.05,  0.05,  0.15,  0.05,  0.1,   0.1,   0.15,  0.1,   0.0,  0.0,  0.05,  0.05,  0.1 ], // Nutr
    [  0.2,   0.1,   0.05,  0.1,   0.3,   0.1,   0.05,  0.1,   0.05,  0.1,  0.05, 0.0,   0.05,  0.15], // Fluid
    [  0.15,  0.2,   0.1,   0.1,   0.1,   0.1,   0.15,  0.2,   0.3,   0.05, 0.05, 0.05,  0.0,   0.3 ], // Infec
    [  0.25,  0.2,   0.15,  0.1,   0.15,  0.1,   0.1,   0.15,  0.15,  0.1,  0.05, 0.1,   0.25,  0.0 ]  // Risk
  ];

  /**
   * Computes matrix-vector product Y = W * S for cross-domain influence propagation.
   */
  public static computeInfluenceVector(stateVector: Float64Array, targetBuffer?: Float64Array): Float64Array {
    const out = targetBuffer || new Float64Array(14);
    for (let i = 0; i < 14; i++) {
      let sum = 0;
      const row = this.INTERACTION_MATRIX[i];
      for (let j = 0; j < 14; j++) {
        sum += row[j] * (stateVector[j] || 0.0);
      }
      out[i] = sum;
    }
    return out;
  }
}
