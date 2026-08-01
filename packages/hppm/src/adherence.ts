// ============================================================================
// HPPM – Capability 5: Adherence Intelligence Module
// ============================================================================

import { HPPMCareProfile, HPPMAdherenceAssessment, HPPMAdherenceAlert, AdherenceDomain } from './types';

export class HPPMAdherenceEngine {

  public assess(profile: HPPMCareProfile): HPPMAdherenceAssessment {
    const alerts: HPPMAdherenceAlert[] = [];
    const ah = profile.adherenceHistory;

    // ── Medication Adherence ──
    alerts.push(this.evaluateDomain('MEDICATION', ah.medicationAdherencePercent, 85,
      profile.preferences.preferOnceDailyDosing));

    // ── Appointment Adherence ──
    alerts.push(this.evaluateDomain('APPOINTMENT', ah.appointmentAdherencePercent, 80,
      profile.preferences.communicationPreference === 'TELEHEALTH'));

    // ── Screening Adherence ──
    alerts.push(this.evaluateDomain('SCREENING', ah.screeningAdherencePercent, 75, false));

    // ── Lifestyle Adherence ──
    alerts.push(this.evaluateDomain('LIFESTYLE', ah.lifestyleAdherencePercent, 60, false));

    // Overall score = weighted average
    const overallScore = Math.round(
      ah.medicationAdherencePercent * 0.40 +
      ah.appointmentAdherencePercent * 0.25 +
      ah.screeningAdherencePercent * 0.20 +
      ah.lifestyleAdherencePercent * 0.15
    );

    const decliningCount = alerts.filter(a => a.trend === 'DECLINING').length;
    const riskOfNonAdherence: HPPMAdherenceAssessment['riskOfNonAdherence'] =
      decliningCount >= 3 || overallScore < 60 ? 'HIGH' :
      decliningCount >= 1 || overallScore < 75 ? 'MODERATE' : 'LOW';

    return {
      overallAdherenceScore: overallScore,
      alerts: alerts.filter(a => a.severity !== 'INFO' || a.trend === 'DECLINING'),
      riskOfNonAdherence
    };
  }

  private evaluateDomain(
    domain: AdherenceDomain,
    currentPercent: number,
    threshold: number,
    hasPreferenceAccommodation: boolean
  ): HPPMAdherenceAlert {
    let trend: HPPMAdherenceAlert['trend'] = 'STABLE';
    let severity: HPPMAdherenceAlert['severity'] = 'INFO';
    let intervention = '';

    if (currentPercent < threshold - 20) {
      trend = 'DECLINING';
      severity = 'ACTION_REQUIRED';
    } else if (currentPercent < threshold) {
      trend = 'DECLINING';
      severity = 'WARNING';
    } else {
      trend = currentPercent >= threshold + 10 ? 'IMPROVING' : 'STABLE';
    }

    switch (domain) {
      case 'MEDICATION':
        intervention = currentPercent < 60
          ? 'Urgent adherence intervention: simplified regimen, pill boxes, pharmacist consultation, motivational interviewing.'
          : currentPercent < threshold
          ? `Adherence support: ${hasPreferenceAccommodation ? 'Once-daily formulations already preferred — add digital reminders.' : 'Consider switching to once-daily formulations and adding reminders.'}`
          : 'Maintain current adherence support. Positive reinforcement.';
        break;
      case 'APPOINTMENT':
        intervention = currentPercent < threshold
          ? `${hasPreferenceAccommodation ? 'Offer telehealth alternatives to reduce appointment barriers.' : 'Implement appointment reminders (SMS/phone) 48h and 2h before visits.'}`
          : 'Continue current scheduling approach.';
        break;
      case 'SCREENING':
        intervention = currentPercent < threshold
          ? 'Create consolidated screening visit to reduce patient burden. Send overdue screening notifications.'
          : 'Continue screening reminder system.';
        break;
      case 'LIFESTYLE':
        intervention = currentPercent < threshold
          ? 'Set micro-goals for incremental lifestyle changes. Consider health coaching or peer support groups.'
          : 'Continue current lifestyle program.';
        break;
    }

    return { domain, currentPercent, trend, severity, intervention };
  }
}
