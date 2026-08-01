import type {
  InferenceRequest,
  InferenceResult,
  PredictiveFeatureVector
} from './pais-types';
import {
  FALLBACK_FEATURE_WEIGHTS,
  CLINICAL_THRESHOLDS,
  NORMALIZATION_BOUNDS
} from './pais-types';
import * as crypto from 'crypto';

/**
 * FallbackRuleEngine subsystem for EWP-012.
 * Computes deterministic predictions when ML models fail or timeout.
 */
export class FallbackRuleEngine {
  /**
   * Computes a deterministic risk score using a weighted sum of raw features.
   * SpO2 is inverted before calculation.
   *
   * @param features - The predictive feature vector.
   * @returns The clamped risk score between 0.0 and 1.0.
   */
  public static computeDeterministicRisk(features: PredictiveFeatureVector): number {
    let riskScore = 0.0;
    
    for (let i = 0; i < 8; i++) {
      const weight = FALLBACK_FEATURE_WEIGHTS[i] || 0.0;
      let val = features.rawVector[i] || 0.0;
      
      // SpO2 is index 3 and inverted for risk contribution
      if (i === 3) {
        val = 1.0 - val;
      }
      riskScore += val * weight;
    }
    
    return Math.max(0.0, Math.min(1.0, riskScore));
  }

  /**
   * Counts the number of clinical threshold violations for a feature vector.
   * Denormalizes features to check against warning bounds.
   *
   * @param features - The predictive feature vector.
   * @returns The count of threshold violations.
   */
  public static countThresholdViolations(features: PredictiveFeatureVector): number {
    let violations = 0;
    for (let i = 0; i < 8; i++) {
      const normalizedValue = features.rawVector[i] || 0.0;
      const bounds = NORMALIZATION_BOUNDS[i] || [0.0, 1.0];
      const min = bounds[0];
      const max = bounds[1];
      const rawValue = normalizedValue * (max - min) + min;
      
      const thresholds = CLINICAL_THRESHOLDS[i];
      if (thresholds) {
        const lowerWarning = thresholds[1];
        const upperWarning = thresholds[2];
        if (rawValue < lowerWarning || rawValue > upperWarning) {
          violations++;
        }
      }
    }
    return violations;
  }

  /**
   * Computes the deterioration probability based on threshold violations.
   *
   * @param features - The predictive feature vector.
   * @returns The computed probability clamped between 0.0 and 1.0.
   */
  public static computeDeteriorationProbability(features: PredictiveFeatureVector): number {
    const violations = this.countThresholdViolations(features);
    const prob = violations / 8.0;
    return Math.max(0.0, Math.min(1.0, prob));
  }

  /**
   * Generates a complete InferenceResult utilizing the rule-based fallback mechanisms.
   *
   * @param request - The original inference request.
   * @param features - The feature vector to analyze.
   * @returns A constructed InferenceResult with fallback triggers active.
   */
  public static generateFallbackResult(
    request: InferenceRequest,
    features: PredictiveFeatureVector
  ): InferenceResult {
    const riskScore = this.computeDeterministicRisk(features);
    const detProb = this.computeDeteriorationProbability(features);
    const predictionId = crypto.randomUUID();
    
    const result: InferenceResult = {
      predictionId,
      patientId: request.patientId,
      timestamp: new Date().toISOString(),
      horizonHours: request.targetHorizonHours,
      predictedRiskScore: riskScore,
      deteriorationProbability: detProb,
      predictedStateVector: Array.from(features.rawVector),
      confidenceInterval: {
        lower: Math.max(0.0, riskScore - 0.1),
        upper: Math.min(1.0, riskScore + 0.1),
        level: 0.95
      },
      explanation: {
        predictionId,
        traceId: crypto.randomUUID(),
        topAttributions: [],
        confidenceScore: 0.5,
        fallbackTriggered: true,
        rationale: 'Deterministic rule-engine fallback: ML model unavailable'
      },
      executionTimeMs: 0,
      modelId: request.modelId,
      domain: request.domain
    };
    
    return result;
  }
}
