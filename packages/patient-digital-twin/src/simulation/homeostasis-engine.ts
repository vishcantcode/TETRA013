export class HomeostasisEngine {
  /**
   * Calculates homeostatic restoration vector H(S) pulling domain states back toward baseline:
   * Hi = -kappa_i * (Si - Sbase_i) * exp(-gamma_i * Di)
   */
  public static computeHomeostaticRestoration(
    currentStateVector: Float64Array,
    baselineVector: Float64Array,
    decompensationIndex: number = 0.0,
    kappa: number = 0.1,
    gamma: number = 2.0,
    targetBuffer?: Float64Array
  ): Float64Array {
    const n = Math.min(currentStateVector.length, baselineVector.length);
    const out = targetBuffer || new Float64Array(n);
    const decayFactor = Math.exp(-gamma * Math.max(0.0, Math.min(1.0, decompensationIndex)));

    for (let i = 0; i < n; i++) {
      const diff = currentStateVector[i] - baselineVector[i];
      out[i] = -kappa * diff * decayFactor;
    }

    return out;
  }
}
