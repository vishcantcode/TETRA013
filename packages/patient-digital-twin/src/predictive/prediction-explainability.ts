import { randomUUID } from 'crypto';
import {
  IExplainabilityEngine,
  PredictiveFeatureVector,
  FeatureAttribution,
  PredictionExplanation,
  FALLBACK_FEATURE_WEIGHTS,
  FEATURE_DIMENSION_LABELS,
  FEATURE_VECTOR_LENGTH
} from './pais-types';

// ─────────────────────────────────────────────────────────────────────────────
// Prediction Explainability Engine — PAIS v1.0 XAI (EWP-012)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates machine-readable feature attributions and structured prediction
 * explanations for every inference result.
 *
 * Attribution methodology: weighted deviation from midpoint (0.5) for each
 * normalized feature dimension. SpO₂ (index 3) is inverted since lower
 * saturation implies higher risk.
 *
 * All explanations carry a cryptographic UUID v4 traceId for end-to-end
 * audit lineage across the DSCS → HPMS → HSSS → CDIS → PAIS pipeline.
 */
export class PredictionExplainabilityEngine implements IExplainabilityEngine {
  /**
   * Classifies the clinical direction of a feature's impact.
   *
   * @param _normalizedValue - The normalized feature value [0.0, 1.0]
   * @param attributionScore - The computed attribution score
   * @returns 'escalating' if positively contributing to risk,
   *          'protective' if negatively contributing, 'neutral' if negligible
   */
  public static classifyDirection(
    _normalizedValue: number,
    attributionScore: number
  ): 'escalating' | 'protective' | 'neutral' {
    if (Math.abs(attributionScore) < 0.01) {
      return 'neutral';
    }
    return attributionScore > 0 ? 'escalating' : 'protective';
  }

  /**
   * Computes feature attributions for all 8 dimensions of the predictive feature vector.
   *
   * Attribution formula per dimension i:
   *   attribution_i = (normalized_i - 0.5) × weight_i
   *   For SpO₂ (i=3): attribution_3 = (0.5 - normalized_3) × weight_3
   *
   * Results are sorted by |attributionScore| descending.
   *
   * @param features - The predictive feature vector with normalized raw values
   * @param _riskScore - The computed risk score (used for context, not computation)
   * @returns Sorted array of 8 FeatureAttribution records
   */
  public computeFeatureAttributions(
    features: PredictiveFeatureVector,
    _riskScore: number
  ): ReadonlyArray<FeatureAttribution> {
    const attributions: FeatureAttribution[] = [];
    const len = Math.min(FEATURE_VECTOR_LENGTH, features.rawVector.length);

    for (let i = 0; i < len; i++) {
      const normalizedValue = features.rawVector[i] ?? 0.0;
      const weight = FALLBACK_FEATURE_WEIGHTS[i] ?? 0.0;

      // SpO₂ (index 3): lower saturation → higher risk → invert deviation
      const attributionScore = i === 3
        ? (0.5 - normalizedValue) * weight
        : (normalizedValue - 0.5) * weight;

      const direction = PredictionExplainabilityEngine.classifyDirection(
        normalizedValue,
        attributionScore
      );

      attributions.push({
        featureName: FEATURE_DIMENSION_LABELS[i] ?? `dimension_${i}`,
        featureIndex: i,
        value: normalizedValue,
        attributionScore,
        direction
      });
    }

    attributions.sort((a, b) => Math.abs(b.attributionScore) - Math.abs(a.attributionScore));
    return attributions;
  }

  /**
   * Generates a complete structured prediction explanation with audit lineage.
   *
   * Includes:
   * - Top-5 feature attributions sorted by impact magnitude
   * - Human-readable rationale highlighting escalating features
   * - Cryptographic trace ID for decision lineage
   * - Fallback trigger flag for audit compliance
   *
   * @param predictionId - UUID of the prediction being explained
   * @param features - The predictive feature vector
   * @param riskScore - The computed risk score [0.0, 1.0]
   * @param fallbackTriggered - Whether deterministic fallback was used
   * @param modelVersion - Optional SemVer of the model used
   * @returns Complete PredictionExplanation conforming to PAIS schema
   */
  public generateExplanation(
    predictionId: string,
    features: PredictiveFeatureVector,
    riskScore: number,
    fallbackTriggered: boolean,
    modelVersion?: string
  ): PredictionExplanation {
    const traceId = randomUUID();
    const allAttributions = this.computeFeatureAttributions(features, riskScore);
    const topAttributions = allAttributions.slice(0, 5) as FeatureAttribution[];

    const escalatingNames = topAttributions
      .filter(attr => attr.direction === 'escalating')
      .map(attr => attr.featureName)
      .join(', ');

    const rationale = escalatingNames.length > 0
      ? `Risk is driven primarily by escalating features: ${escalatingNames}.`
      : 'Risk is stable or protective across dominant features.';

    return {
      predictionId,
      traceId,
      topAttributions,
      confidenceScore: features.overallConfidence,
      fallbackTriggered,
      rationale,
      modelVersion
    };
  }
}
