// ============================================================================
// HPPHI – Capability 3: Longitudinal Preventive Monitoring
// ============================================================================

import { HPPHIPatientInput, HPPHIMonitoringAlert, MonitoringAlertType } from './types';
import { hcpi } from '@healthsense/hcpi';

export class HPPHIMonitoringEngine {

  public evaluate(patient: HPPHIPatientInput): HPPHIMonitoringAlert[] {
    const alerts: HPPHIMonitoringAlert[] = [];

    // Leverage HCPI for longitudinal context
    const longitudinal = hcpi.analyzePatientLongitudinal(patient.patientId);

    // 1. Check biomarker worsening from HCPI trajectory
    if (longitudinal.riskEvolution.trajectory === 'DETERIORATING') {
      alerts.push({
        alertType: 'RISK_TREND',
        description: `Overall risk trajectory is DETERIORATING (score: ${longitudinal.riskEvolution.currentRiskScore}).`,
        severity: 'ACTION_REQUIRED',
        recommendation: 'Review current treatment plan and consider therapy intensification.'
      });
    }

    // 2. Check specific biomarkers
    const sysBp = patient.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    if (sysBp !== undefined && sysBp >= 140) {
      alerts.push({
        alertType: 'BIOMARKER_WORSENING',
        description: `Systolic BP elevated at ${sysBp} mmHg — above target of 130 mmHg.`,
        severity: sysBp >= 160 ? 'ACTION_REQUIRED' : 'WARNING',
        metric: 'Systolic BP',
        currentValue: sysBp,
        recommendation: sysBp >= 160
          ? 'Urgent medication review and lifestyle intervention required.'
          : 'Consider lifestyle modifications and medication dose adjustment.'
      });
    }

    const hba1c = patient.laboratoryResults.find(l => l.test === 'HbA1c')?.value;
    if (hba1c !== undefined && hba1c >= 7.5) {
      alerts.push({
        alertType: 'BIOMARKER_WORSENING',
        description: `HbA1c elevated at ${hba1c}% — above target of 7.0%.`,
        severity: hba1c >= 9.0 ? 'ACTION_REQUIRED' : 'WARNING',
        metric: 'HbA1c',
        currentValue: hba1c,
        recommendation: 'Intensify glycemic management. Consider additional anti-diabetic therapy.'
      });
    }

    const ldl = patient.laboratoryResults.find(l => l.test === 'LDL')?.value;
    if (ldl !== undefined && ldl >= 160) {
      alerts.push({
        alertType: 'BIOMARKER_WORSENING',
        description: `LDL elevated at ${ldl} mg/dL — above recommended threshold.`,
        severity: 'WARNING',
        metric: 'LDL',
        currentValue: ldl,
        recommendation: 'Consider statin therapy or dose intensification. Reinforce dietary counseling.'
      });
    }

    // 3. Adherence decline detection
    if (longitudinal.profile.adherenceScore < 80) {
      alerts.push({
        alertType: 'ADHERENCE_DECLINE',
        description: `Medication adherence score declined to ${longitudinal.profile.adherenceScore}% (target ≥85%).`,
        severity: longitudinal.profile.adherenceScore < 60 ? 'ACTION_REQUIRED' : 'WARNING',
        metric: 'Adherence Score',
        currentValue: longitudinal.profile.adherenceScore,
        recommendation: 'Address barriers to adherence: simplify regimen, patient education, reminder systems.'
      });
    }

    // 4. Missed preventive care
    for (const screening of patient.previousScreenings) {
      const daysSince = Math.floor((Date.now() - screening.lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 730) { // More than 2 years
        alerts.push({
          alertType: 'MISSED_SCREENING',
          description: `"${screening.screening}" overdue: last performed ${daysSince} days ago.`,
          severity: 'WARNING',
          recommendation: `Schedule ${screening.screening} at earliest convenience.`
        });
      }
    }

    // 5. Recurring unhealthy patterns
    if (patient.lifestyleFactors.smokingStatus === 'CURRENT') {
      alerts.push({
        alertType: 'RECURRING_PATTERN',
        description: 'Active smoking detected — persistent modifiable risk factor.',
        severity: 'ACTION_REQUIRED',
        recommendation: 'Initiate smoking cessation program. Consider pharmacotherapy (varenicline, NRT).'
      });
    }

    if (patient.lifestyleFactors.sleepHoursPerNight < 6 && patient.lifestyleFactors.stressLevel === 'HIGH') {
      alerts.push({
        alertType: 'RECURRING_PATTERN',
        description: 'Combination of poor sleep and high stress — elevated psychosomatic risk.',
        severity: 'WARNING',
        recommendation: 'Sleep hygiene counseling, stress management techniques, consider CBT-I referral.'
      });
    }

    return alerts;
  }
}
