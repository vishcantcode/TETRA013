// ============================================================================
// ACDSS – Capability 7: Clinical Prioritization Engine
// ============================================================================

import { ACDSSPatientCase, ACDSSPrioritization, ClinicalPriority, ACDSSMedicationSafetyResult, ACDSSReferralRecommendation } from './types';

export class ACDSSPrioritizationEngine {

  public evaluate(
    patientCase: ACDSSPatientCase,
    medicationSafety: ACDSSMedicationSafetyResult,
    referrals: ACDSSReferralRecommendation[]
  ): ACDSSPrioritization {
    const reasoning: string[] = [];
    const contributingFactors: string[] = [];
    let priority: ClinicalPriority = 'ROUTINE';

    // ── Factor 1: Medication Safety ──
    if (medicationSafety.overallSafetyStatus === 'CRITICAL_STOP') {
      priority = 'EMERGENCY';
      reasoning.push('Critical medication safety alert detected requiring immediate intervention.');
      contributingFactors.push(`${medicationSafety.criticalCount} CRITICAL medication alert(s)`);
    } else if (medicationSafety.overallSafetyStatus === 'INTERVENTION_REQUIRED') {
      priority = this.escalate(priority, 'HIGH_PRIORITY');
      reasoning.push('High-severity medication safety issue requiring clinician review.');
      contributingFactors.push(`${medicationSafety.highCount} HIGH severity medication alert(s)`);
    }

    // ── Factor 2: Referral Urgency ──
    const emergentReferrals = referrals.filter(r => r.urgency === 'EMERGENT');
    const urgentReferrals = referrals.filter(r => r.urgency === 'URGENT');
    if (emergentReferrals.length > 0) {
      priority = 'EMERGENCY';
      reasoning.push(`Emergent referral(s) recommended: ${emergentReferrals.map(r => r.specialty).join(', ')}.`);
      contributingFactors.push('Emergent specialist referral indicated');
    } else if (urgentReferrals.length > 0) {
      priority = this.escalate(priority, 'URGENT');
      reasoning.push(`Urgent referral(s) recommended: ${urgentReferrals.map(r => r.specialty).join(', ')}.`);
      contributingFactors.push('Urgent specialist referral indicated');
    }

    // ── Factor 3: Critical Vital Signs ──
    const sysBp = patientCase.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    if (sysBp !== undefined) {
      if (sysBp >= 180) {
        priority = this.escalate(priority, 'EMERGENCY');
        reasoning.push(`Systolic BP ${sysBp} mmHg — hypertensive emergency threshold.`);
        contributingFactors.push('Hypertensive emergency');
      } else if (sysBp >= 160) {
        priority = this.escalate(priority, 'URGENT');
        reasoning.push(`Systolic BP ${sysBp} mmHg — significantly elevated.`);
        contributingFactors.push('Severely elevated blood pressure');
      }
    }

    const hr = patientCase.vitalSigns.find(v => v.metric === 'Heart Rate')?.value;
    if (hr !== undefined) {
      if (hr > 120 || hr < 50) {
        priority = this.escalate(priority, 'URGENT');
        reasoning.push(`Heart rate ${hr} bpm — outside normal range.`);
        contributingFactors.push('Abnormal heart rate');
      }
    }

    // ── Factor 4: Critical Lab Values ──
    const potassium = patientCase.laboratoryResults.find(l => l.test === 'Potassium')?.value;
    if (potassium !== undefined && (potassium > 6.0 || potassium < 3.0)) {
      priority = this.escalate(priority, 'EMERGENCY');
      reasoning.push(`Potassium ${potassium} mEq/L — critical electrolyte imbalance.`);
      contributingFactors.push('Critical potassium level');
    }

    const glucose = patientCase.laboratoryResults.find(l => l.test === 'Fasting Glucose')?.value;
    if (glucose !== undefined && (glucose > 400 || glucose < 50)) {
      priority = this.escalate(priority, 'EMERGENCY');
      reasoning.push(`Glucose ${glucose} mg/dL — critical glycemic emergency.`);
      contributingFactors.push('Critical glucose level');
    }

    // ── Factor 5: Multi-morbidity burden ──
    if (patientCase.chronicConditions.length >= 4) {
      priority = this.escalate(priority, 'HIGH_PRIORITY');
      reasoning.push(`High comorbidity burden: ${patientCase.chronicConditions.length} chronic conditions.`);
      contributingFactors.push('Multi-morbidity');
    }

    // ── Factor 6: Age ──
    if (patientCase.age >= 75) {
      priority = this.escalate(priority, 'HIGH_PRIORITY');
      reasoning.push('Patient age ≥75 years warrants elevated clinical vigilance.');
      contributingFactors.push('Advanced age');
    }

    // Default reasoning if still routine
    if (priority === 'ROUTINE') {
      reasoning.push('No critical findings, urgent referrals, or dangerous vital sign abnormalities detected.');
      contributingFactors.push('All findings within acceptable clinical ranges');
    }

    return { priority, reasoning, contributingFactors };
  }

  private escalate(current: ClinicalPriority, proposed: ClinicalPriority): ClinicalPriority {
    const order: Record<ClinicalPriority, number> = {
      'ROUTINE': 0,
      'URGENT': 1,
      'HIGH_PRIORITY': 2,
      'EMERGENCY': 3
    };
    return order[proposed] > order[current] ? proposed : current;
  }
}
