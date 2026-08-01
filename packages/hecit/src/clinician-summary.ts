// ============================================================================
// HECIT – Capability 7: Clinician Summary Generator
// ============================================================================

import { HECITClinicianSummary } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITClinicianSummaryEngine {

  public generateSummary(
    profile: HPPMCareProfile,
    primaryRec: string,
    evidenceSummary: string
  ): HECITClinicianSummary {
    const sysBp = profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    const hba1c = profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value;

    const keyFindings = [
      `62M with ${profile.chronicConditions.join(', ')}.`,
      sysBp ? `Blood Pressure: ${sysBp} mmHg systolic (Target <130 mmHg).` : 'BP: Not measured.',
      hba1c ? `HbA1c: ${hba1c}% (Target <7.0%).` : 'HbA1c: Not measured.',
      `Current Medication Adherence: ${profile.adherenceHistory.medicationAdherencePercent}%.`,
    ];

    const topRisks: string[] = [];
    if (sysBp && sysBp >= 140) topRisks.push('Stage 2 Hypertension — Elevated risk of cardiovascular target organ damage.');
    if (hba1c && hba1c >= 7.5) topRisks.push('Suboptimal glycemic control — diabetic microvascular disease progression risk.');
    if (profile.adherenceHistory.medicationAdherencePercent < 80) topRisks.push('High risk of non-adherence driven treatment failure.');

    const recommendedActions = [
      { action: primaryRec, priority: 'HIGH' as const },
      { action: 'Review home BP logs and reinforce medication adherence strategy.', priority: 'HIGH' as const },
      { action: 'Schedule repeat HbA1c and renal function panel in 90 days.', priority: 'ROUTINE' as const },
    ];

    const followUpPriorities = [
      'Evaluate medication fill records at 30 days',
      'Check renal function (eGFR/Creatinine) at 90-day review',
      'Assess lifestyle walking goal progress at 60 days',
    ];

    return {
      patientId: profile.patientId,
      headlineSummary: `Clinical Summary for Patient ${profile.patientId}: Suboptimal BP & glycemic control requiring regimen optimization & adherence support.`,
      keyFindings,
      topRisks,
      recommendedActions,
      evidenceSummary,
      followUpPriorities,
      evaluatedAt: new Date(),
    };
  }
}
