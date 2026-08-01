import { randomUUID } from 'crypto';
import {
  IDriftDetector,
  PAISEngineConfiguration,
  PAISEngineConfigurationSchema,
  DriftReport
} from './pais-types';

// ─────────────────────────────────────────────────────────────────────────────
// Drift Detector — PAIS v1.0 Data & Concept Drift Detection (EWP-012)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects data drift and concept drift using Population Stability Index (PSI)
 * and Kolmogorov-Smirnov (KS) statistical tests.
 *
 * PSI Formula: PSI = Σ(Aᵢ - Eᵢ) × ln(Aᵢ / Eᵢ)
 * KS Statistic: KS = max|F_expected(x) - F_actual(x)|
 *
 * Drift severity classification:
 * - none:     PSI < 0.10
 * - minor:    0.10 ≤ PSI < 0.25
 * - moderate: 0.25 ≤ PSI < 0.50
 * - severe:   PSI ≥ 0.50
 */
export class DriftDetector implements IDriftDetector {
  private readonly config: PAISEngineConfiguration;

  /**
   * Constructs the DriftDetector with optional configuration.
   * @param config - Optional partial PAIS engine configuration
   */
  public constructor(config?: Partial<PAISEngineConfiguration>) {
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
  }

  /**
   * Builds a normalized histogram from an array of values.
   * Adds epsilon (1e-10) to prevent zero-bin division in PSI computation.
   *
   * @param values - Input values to bin
   * @param binCount - Number of equal-width bins
   * @returns Normalized proportions per bin (sums to ~1.0)
   */
  public static buildHistogram(values: Float64Array, binCount: number): Float64Array {
    const hist = new Float64Array(binCount);
    if (values.length === 0) return hist;

    let min = values[0]!;
    let max = values[0]!;
    for (let i = 1; i < values.length; i++) {
      if (values[i]! < min) min = values[i]!;
      if (values[i]! > max) max = values[i]!;
    }

    if (min === max) {
      hist[0] = 1.0;
      return hist;
    }

    const binWidth = (max - min) / binCount;
    for (let i = 0; i < values.length; i++) {
      let bin = Math.floor((values[i]! - min) / binWidth);
      if (bin >= binCount) bin = binCount - 1;
      hist[bin]++;
    }

    const epsilon = 1e-10;
    let sum = 0;
    for (let i = 0; i < binCount; i++) {
      hist[i] = (hist[i]! / values.length) + epsilon;
      sum += hist[i]!;
    }

    for (let i = 0; i < binCount; i++) {
      hist[i] /= sum;
    }

    return hist;
  }

  /**
   * Computes the Population Stability Index (PSI) between two distributions.
   *
   * PSI = Σᵢ (Aᵢ - Eᵢ) × ln(Aᵢ / Eᵢ)
   *
   * @param expected - Expected (baseline) distribution values
   * @param actual - Actual (current) distribution values
   * @param binCount - Number of histogram bins (default: config.driftBinCount)
   * @returns Non-negative PSI score
   */
  public computePSI(expected: Float64Array, actual: Float64Array, binCount?: number): number {
    const bins = binCount ?? this.config.driftBinCount;
    const expectedHist = DriftDetector.buildHistogram(expected, bins);
    const actualHist = DriftDetector.buildHistogram(actual, bins);

    let psi = 0;
    for (let i = 0; i < bins; i++) {
      const e = expectedHist[i]!;
      const a = actualHist[i]!;
      psi += (a - e) * Math.log(a / e);
    }
    return Math.max(0, psi);
  }

  /**
   * Computes the Kolmogorov-Smirnov (KS) test statistic.
   *
   * KS = max|F_expected(x) - F_actual(x)| over all unique values.
   *
   * @param expected - Expected distribution values
   * @param actual - Actual distribution values
   * @returns KS statistic in [0, 1]
   */
  public computeKSStatistic(expected: Float64Array, actual: Float64Array): number {
    if (expected.length === 0 || actual.length === 0) return 0;

    const eSorted = new Float64Array(expected).sort();
    const aSorted = new Float64Array(actual).sort();

    const allValues = new Set([...Array.from(eSorted), ...Array.from(aSorted)]);
    const uniqueValues = Array.from(allValues).sort((a, b) => a - b);

    let maxDiff = 0;
    let eIdx = 0;
    let aIdx = 0;

    for (const val of uniqueValues) {
      while (eIdx < eSorted.length && eSorted[eIdx]! <= val) eIdx++;
      while (aIdx < aSorted.length && aSorted[aIdx]! <= val) aIdx++;

      const eCdf = eIdx / eSorted.length;
      const aCdf = aIdx / aSorted.length;
      const diff = Math.abs(eCdf - aCdf);
      if (diff > maxDiff) maxDiff = diff;
    }

    return maxDiff;
  }

  /**
   * Determines if drift is detected based on PSI and KS thresholds.
   *
   * @param psi - PSI score
   * @param ksStatistic - KS test statistic
   * @returns True if either threshold is exceeded
   */
  public isDrifting(psi: number, ksStatistic: number): boolean {
    return psi > this.config.driftPsiThreshold || ksStatistic > this.config.driftKsThreshold;
  }

  /**
   * Evaluates drift and generates a comprehensive DriftReport.
   *
   * @param modelId - UUID of the model being evaluated
   * @param expected - Expected (baseline) distribution
   * @param actual - Actual (current) distribution
   * @returns Structured DriftReport with severity classification
   */
  public evaluateDrift(modelId: string, expected: Float64Array, actual: Float64Array): DriftReport {
    const psiScore = this.computePSI(expected, actual);
    const ksStatistic = this.computeKSStatistic(expected, actual);
    const drifting = this.isDrifting(psiScore, ksStatistic);

    let driftSeverity: 'none' | 'minor' | 'moderate' | 'severe' = 'none';
    if (psiScore > 0.5) {
      driftSeverity = 'severe';
    } else if (psiScore >= 0.25) {
      driftSeverity = 'moderate';
    } else if (psiScore >= 0.1) {
      driftSeverity = 'minor';
    }

    return {
      modelId,
      reportId: randomUUID(),
      psiScore,
      ksStatistic,
      isDrifting: drifting,
      driftSeverity,
      affectedFeatures: [],
      baselineSampleCount: expected.length,
      currentSampleCount: actual.length,
      detectedAt: new Date().toISOString()
    };
  }
}
