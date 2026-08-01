// ============================================================================
// HCQSG – Capability 6: Clinical KPI Engine
// ============================================================================

import { HCQSGClinicalKPIs } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HCQSGClinicalKPIEngine {

  public computeKPIs(profile: HPPMCareProfile): HCQSGClinicalKPIs {
    const ah = profile.adherenceHistory;

    const medAdherence = ah.medicationAdherencePercent;
    const screeningComp = ah.screeningAdherencePercent;
    const appointmentComp = ah.appointmentAdherencePercent;
    const lifestyleComp = ah.lifestyleAdherencePercent;
    const carePlanComp = Math.round((medAdherence + lifestyleComp) / 2);
    const outcomeImprovement = 85.0; // percentage of metrics meeting target

    const overallKPIHealthScore = Math.round(
      medAdherence * 0.3 +
      screeningComp * 0.2 +
      appointmentComp * 0.2 +
      carePlanComp * 0.15 +
      outcomeImprovement * 0.15
    );

    return {
      medicationAdherenceRatePercent: medAdherence,
      preventiveScreeningCompletionPercent: screeningComp,
      referralCompletionPercent: appointmentComp,
      carePlanCompletionPercent: carePlanComp,
      followUpCompliancePercent: appointmentComp,
      outcomeImprovementPercent: outcomeImprovement,
      overallKPIHealthScore,
    };
  }
}
