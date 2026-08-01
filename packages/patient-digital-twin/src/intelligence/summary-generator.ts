import { TwinState } from '../domain';
import { ClinicalSummary, ClinicalSummarySchema, DerivedFeatures, RiskInsight, ThresholdViolation } from './types';

export class SummaryGenerator {
  /**
   * Constructs a 100% structured JSON clinical summary object from intelligence outputs.
   */
  public static generateSummary(
    state: TwinState,
    derivedFeatures: DerivedFeatures,
    riskInsight: RiskInsight,
    violations: ThresholdViolation[]
  ): ClinicalSummary {
    const unstableSystems: string[] = [];
    for (const v of violations) {
      if (!unstableSystems.includes(v.metric)) {
        unstableSystems.push(v.metric);
      }
    }

    const significantTrends: string[] = [];
    if (derivedFeatures.shockIndex && derivedFeatures.shockIndex > 0.9) {
      significantTrends.push('elevated_shock_index');
    }
    if (riskInsight.riskDelta > 0.05) {
      significantTrends.push('risk_score_escalation');
    }

    return ClinicalSummarySchema.parse({
      patientId: state.patientId,
      timestamp: state.lastTimestamp || new Date().toISOString(),
      version: state.version,
      physiologicalStability: derivedFeatures.compositeVitalStability,
      overallConfidence: derivedFeatures.confidenceWeight,
      derivedFeatures,
      riskInsight,
      violations,
      mostUnstableSystems: unstableSystems,
      significantTrends
    });
  }
}
