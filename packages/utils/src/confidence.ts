/**
 * Confidence Calibration & Data Completeness Scoring
 */

export interface CompletenessScoreInput {
  hasVitals: boolean;
  hasHbA1c: boolean;
  haseGFR: boolean;
  hasUACR: boolean;
  hasLipidPanel: boolean;
}

export function calculateConfidenceScore(input: CompletenessScoreInput): number {
  let score = 0.50; // Base score for demographic entry

  if (input.hasVitals) score += 0.15;
  if (input.hasHbA1c) score += 0.15;
  if (input.haseGFR) score += 0.10;
  if (input.hasUACR) score += 0.05;
  if (input.hasLipidPanel) score += 0.05;

  return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
}

export function categorizeRiskTier(score: number): 'low' | 'moderate' | 'high' | 'severe' {
  if (score < 25) return 'low';
  if (score < 60) return 'moderate';
  if (score < 85) return 'high';
  return 'severe';
}
