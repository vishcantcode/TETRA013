import { RiskSeverityTier } from '@healthsense/clinical-models';

export function getRiskTierFromScore(score: number): RiskSeverityTier {
  if (score < 25) return 'low';
  if (score < 60) return 'moderate';
  if (score < 85) return 'high';
  return 'severe';
}
