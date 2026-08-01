// ============================================================================
// HCQSG – Capability 3: Safety Validation Framework
// ============================================================================

import crypto from 'node:crypto';
import { HCQSGSafetyValidationResult, HCQSGSafetyAlert } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HCQSGSafetyValidationFramework {

  public validateSafety(profile: HPPMCareProfile): HCQSGSafetyValidationResult {
    const alerts: HCQSGSafetyAlert[] = [];

    // Safety Check 1: Allergy Contraindication Check
    for (const allergy of profile.allergies) {
      for (const med of profile.currentMedications) {
        if (med.toLowerCase().includes(allergy.toLowerCase())) {
          alerts.push({
            alertId: `alert-${crypto.randomUUID().slice(0, 8)}`,
            category: 'CONTRAINDICATION',
            severity: 'CRITICAL',
            description: `Known allergy contraindication: ${med} matches allergen "${allergy}".`,
            affectedItem: med,
            requiredAction: `Immediately discontinue ${med} and select non-allergen alternative.`,
          });
        }
      }
    }

    // Safety Check 2: Abnormal Laboratory Result Escalation
    const egfr = profile.laboratoryResults.find(l => l.test === 'eGFR')?.value;
    if (egfr && egfr < 30) {
      alerts.push({
        alertId: `alert-${crypto.randomUUID().slice(0, 8)}`,
        category: 'ABNORMAL_RESULT_ESCALATION',
        severity: 'CRITICAL',
        description: `Severe renal impairment (eGFR ${egfr} mL/min/1.73m²) requires urgent dosage adjustment.`,
        affectedItem: 'Renal Function (eGFR)',
        requiredAction: 'Adjust or discontinue renally cleared medications (e.g. Metformin).',
      });
    }

    // Safety Check 3: Missing Follow-up Actions
    if (profile.chronicConditions.some(c => c.toLowerCase().includes('hypertension'))) {
      const hasRecentBp = profile.vitalSigns.some(v => v.metric === 'Systolic BP');
      if (!hasRecentBp) {
        alerts.push({
          alertId: `alert-${crypto.randomUUID().slice(0, 8)}`,
          category: 'MISSING_FOLLOWUP',
          severity: 'WARNING',
          description: 'Hypertensive patient has no recorded blood pressure reading in current session.',
          affectedItem: 'Blood Pressure Monitoring',
          requiredAction: 'Obtain updated vital signs before finalizing treatment plan.',
        });
      }
    }

    // Safety Check 4: Unsafe Drug Combinations (Simvastatin + Amlodipine high dose check)
    const hasSimva = profile.currentMedications.some(m => m.toLowerCase().includes('simvastatin'));
    const hasAmlo = profile.currentMedications.some(m => m.toLowerCase().includes('amlodipine'));
    if (hasSimva && hasAmlo) {
      alerts.push({
        alertId: `alert-${crypto.randomUUID().slice(0, 8)}`,
        category: 'UNSAFE_COMBINATION',
        severity: 'WARNING',
        description: 'Simvastatin + Amlodipine interaction: Limit simvastatin dose to ≤20mg daily to reduce myopathy risk.',
        affectedItem: 'Simvastatin + Amlodipine',
        requiredAction: 'Verify simvastatin dose does not exceed 20mg/day.',
      });
    }

    const hasCritical = alerts.some(a => a.severity === 'CRITICAL');
    const hasWarning = alerts.some(a => a.severity === 'WARNING');

    return {
      safetyStatus: hasCritical ? 'CRITICAL_ALERT' : hasWarning ? 'WARNING' : 'PASS',
      alerts,
      isSafeForExecution: !hasCritical,
    };
  }
}
