import {
  IUncertaintyEngine,
  PAISEngineConfiguration,
  PAISEngineConfigurationSchema,
  UncertaintyEstimate,
  ConfidenceInterval,
  PredictiveFeatureVector,
  FEATURE_VECTOR_LENGTH
} from './pais-types';

// ─────────────────────────────────────────────────────────────────────────────
// Uncertainty Engine — PAIS v1.0 Confidence & OOD Detection (EWP-012)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimates prediction uncertainty by decomposing into aleatoric (data noise)
 * and epistemic (model confidence gap) components.
 *
 * - Aleatoric uncertainty: standard deviation of the normalized feature vector
 * - Epistemic uncertainty: 1.0 − overallConfidence
 * - Total uncertainty: √(aleatoric² + epistemic²)
 * - Out-of-distribution: any normalized feature < 0.01 or > 0.99
 * - Calibration score: 1 − |riskScore − 0.5| (lower at decision boundary)
 * - Reliability score: 1 − totalUncertainty, clamped [0, 1]
 */
export class UncertaintyEngine implements IUncertaintyEngine {
  private readonly config: PAISEngineConfiguration;

  /**
   * Constructs the UncertaintyEngine.
   * @param config - Optional partial PAIS engine configuration
   */
  public constructor(config?: Partial<PAISEngineConfiguration>) {
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
  }

  /**
   * Computes standard deviation of a numeric array.
   * @param arr - Array of numbers
   * @returns Population standard deviation
   */
  private static computeStdDev(arr: ReadonlyArray<number>): number {
    if (arr.length === 0) return 0;
    const n = arr.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += arr[i]!;
    }
    const mean = sum / n;

    let varianceSum = 0;
    for (let i = 0; i < n; i++) {
      const diff = arr[i]! - mean;
      varianceSum += diff * diff;
    }
    return Math.sqrt(varianceSum / n);
  }

  /**
   * Estimates total uncertainty for a prediction, decomposed into
   * aleatoric and epistemic components.
   *
   * @param predictionId - UUID of the prediction
   * @param features - The predictive feature vector
   * @param _riskScore - The computed risk score (used for calibration)
   * @returns Complete UncertaintyEstimate with OOD flag
   */
  public estimateUncertainty(
    predictionId: string,
    features: PredictiveFeatureVector,
    _riskScore: number
  ): UncertaintyEstimate {
    // Aleatoric: data noise measured by feature variance
    const aleatoric = UncertaintyEngine.computeStdDev(features.rawVector);

    // Epistemic: gap in model confidence
    const epistemic = 1.0 - features.overallConfidence;

    // Total: root-sum-square
    const totalUncertainty = Math.sqrt(aleatoric * aleatoric + epistemic * epistemic);

    // Out-of-distribution: extreme feature values
    let isOutOfDistribution = false;
    const len = Math.min(FEATURE_VECTOR_LENGTH, features.rawVector.length);
    for (let i = 0; i < len; i++) {
      const val = features.rawVector[i]!;
      if (val < 0.01 || val > 0.99) {
        isOutOfDistribution = true;
        break;
      }
    }

    // Calibration: higher when predictions are away from the decision boundary
    const calibrationScore = 1.0 - Math.abs(_riskScore - 0.5);

    // Reliability: inverse of total uncertainty
    const reliabilityScore = Math.max(0, Math.min(1, 1.0 - totalUncertainty));

    return {
      predictionId,
      aleatoric,
      epistemic,
      totalUncertainty,
      isOutOfDistribution,
      calibrationScore,
      reliabilityScore
    };
  }

  /**
   * Computes a confidence interval for a risk score given uncertainty.
   *
   * Uses the configured z-score (default 1.96 for 95% CI):
   *   lower = clamp(riskScore − z × uncertainty, 0, 1)
   *   upper = clamp(riskScore + z × uncertainty, 0, 1)
   *
   * @param riskScore - The predicted risk score
   * @param uncertainty - Total uncertainty estimate
   * @param level - Confidence level (default: 0.95)
   * @returns Confidence interval with bounds and level
   */
  public computeConfidenceInterval(
    riskScore: number,
    uncertainty: number,
    level?: number
  ): ConfidenceInterval {
    const confLevel = level ?? this.config.confidenceLevel;
    const zScore = this.config.confidenceZScore;

    const lower = Math.max(0, Math.min(1, riskScore - zScore * uncertainty));
    const upper = Math.max(0, Math.min(1, riskScore + zScore * uncertainty));

    return {
      lower,
      upper,
      level: confLevel
    };
  }
}
