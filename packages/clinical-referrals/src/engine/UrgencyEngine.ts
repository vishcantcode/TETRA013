import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ReferralPriority, ReferralPriorityCategory } from '../interfaces/ReferralPriority';
import { PriorityResolver } from '../utils/PriorityResolver';

export class UrgencyEngine {
  public evaluateUrgency(assessment: UnifiedRiskAssessment): ReferralPriority {
    const f = assessment.snapshot.features;
    const isCritical = (f.systolicBP !== null && f.systolicBP >= 168) || (f.egfr !== null && f.egfr < 30);
    const hasGuidelineTrigger = assessment.overallRiskScore >= 60;

    const resolution = PriorityResolver.resolveConflict(assessment.overallRiskScore, hasGuidelineTrigger, isCritical);

    const timeframeMap: Record<ReferralPriorityCategory, number> = {
      'Emergency': 0,
      'Within 24 Hours': 1,
      'Within 48 Hours': 2,
      'Within 7 Days': 7,
      'Routine': 30,
      'Annual Review': 365
    };

    return {
      category: resolution.category,
      urgencyExplanation: resolution.rationale,
      recommendedTimeframeDays: timeframeMap[resolution.category]
    };
  }
}
