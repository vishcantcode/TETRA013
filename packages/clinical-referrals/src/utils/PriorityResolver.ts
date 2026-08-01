import { ReferralPriorityCategory } from '../interfaces/ReferralPriority';

export class PriorityResolver {
  public static resolveConflict(
    mlRiskScore: number,
    hasGuidelineTrigger: boolean,
    isBiomarkerCritical: boolean
  ): { category: ReferralPriorityCategory; rationale: string } {
    if (isBiomarkerCritical) {
      return {
        category: 'Within 24 Hours',
        rationale: 'Critical lab/vital finding mandates urgent specialist evaluation regardless of ML score.'
      };
    }

    if (mlRiskScore >= 85 && !hasGuidelineTrigger) {
      // Conservative recommendation: escalation to 7 Days
      return {
        category: 'Within 7 Days',
        rationale: 'Elevated statistical ML risk detected; conservative clinical review scheduled despite absence of overt guideline threshold trigger.'
      };
    }

    if (hasGuidelineTrigger && mlRiskScore >= 75) {
      return {
        category: 'Within 48 Hours',
        rationale: 'Confirmed clinical guideline threshold breach supported by high ML risk score.'
      };
    }

    if (hasGuidelineTrigger) {
      return {
        category: 'Within 7 Days',
        rationale: 'Guideline protocol recommendation triggered for routine specialist workup.'
      };
    }

    return {
      category: 'Routine',
      rationale: 'Standard outpatient follow-up schedule.'
    };
  }
}
