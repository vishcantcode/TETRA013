// ============================================================================
// HCQSG – Capability 4: Continuous Validation Services
// ============================================================================

import { HCQSGContinuousValidationMetrics } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HCQSGContinuousValidationServices {

  public validateContinuously(profile: HPPMCareProfile): HCQSGContinuousValidationMetrics {
    // Simulated aggregate clinical outcome validation metrics
    const acceptanceRate = 92.5;
    const overrideRate = 7.5;
    const outcomeSuccess = 88.0;
    const simulationAccuracy = 94.2;
    const preventiveEffectiveness = 85.0;

    const reviewReasons: string[] = [];
    if (profile.adherenceHistory.medicationAdherencePercent < 70) {
      reviewReasons.push('Medication adherence under 70% — flagged for adherence coaching review.');
    }
    if (overrideRate > 10.0) {
      reviewReasons.push('Clinician override rate exceeded threshold (>10%).');
    }

    return {
      clinicianAcceptanceRatePercent: acceptanceRate,
      clinicianOverrideRatePercent: overrideRate,
      treatmentOutcomeSuccessPercent: outcomeSuccess,
      simulationAccuracyPercent: simulationAccuracy,
      preventiveEffectivenessPercent: preventiveEffectiveness,
      flaggedForReview: reviewReasons.length > 0,
      reviewReasons,
    };
  }
}
