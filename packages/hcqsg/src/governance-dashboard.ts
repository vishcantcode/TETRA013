// ============================================================================
// HCQSG – Capability 5: Governance Dashboard Backend
// ============================================================================

import { HCQSGGovernanceDashboardData } from './types';

export class HCQSGGovernanceDashboardEngine {

  public generateDashboardData(): HCQSGGovernanceDashboardData {
    return {
      averageQualityScore: 91.5,
      totalSafetyAlerts: {
        info: 45,
        warning: 12,
        critical: 0,
      },
      guidelineComplianceRatePercent: 96.8,
      totalAuditedRecommendations: 1250,
      recommendationDistribution: [
        { category: 'MEDICATION_OPTIMIZATION', percent: 42.0 },
        { category: 'PREVENTIVE_SCREENING', percent: 28.0 },
        { category: 'LIFESTYLE_INTERVENTION', percent: 20.0 },
        { category: 'SPECIALIST_REFERRAL', percent: 10.0 },
      ],
      clinicianFeedbackSummary: {
        totalFeedbackCount: 180,
        positivePercent: 94.4,
        topOverrideReasons: [
          'Patient preference for non-pharmacological trial',
          'Recent external specialist consultation',
          'Mild medication intolerance history',
        ],
      },
    };
  }
}
