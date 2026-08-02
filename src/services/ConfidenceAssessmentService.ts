import { Patient } from '../types';
import { ConfidenceReport } from '../types';

/**
 * ConfidenceAssessmentService evaluates the reliability of disease predictions
 * based on data completeness, recency, and consistency.
 * It returns a `ConfidenceReport` that can be merged with prediction results.
 */
export class ConfidenceAssessmentService {
  // Penalty constants (percentage points subtracted from 100)
  private static readonly PENALTIES = {
    missingHbA1c: 20,
    missingLDL: 10,
    missingCreatinine: 15,
    outdatedLab: 15, // labs older than 6 months
    unknownMedicationHistory: 10,
    missingSymptoms: 10,
    contradictoryInputs: 15,
  };

  /**
   * Checks if a given ISO date string is older than the specified number of months.
   */
  private static isOutdated(dateStr: string, months: number): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    return diffMonths > months;
  }

  /**
   * Evaluate the patient record and produce a confidence report.
   * The logic follows the penalty rules defined in the implementation plan.
   */
  public static evaluatePatientData(patient: Patient): ConfidenceReport {
    let confidence = 100;
    const missingInputs: string[] = [];
    const estimatedValues: string[] = [];
    const evidenceQuality: string[] = [];
    const reasons: string[] = [];

    // ----- Missing laboratory investigations -----
    const labs = patient.vitalsHistory?.length ? patient.vitalsHistory[patient.vitalsHistory.length - 1] : undefined;
    // Use latest available vitalsHistory record or current vitals as fallback
    const latest = labs || patient.vitals;
    if (latest && (latest as any).hba1c == null) {
      confidence -= this.PENALTIES.missingHbA1c;
      missingInputs.push('HbA1c');
      reasons.push('HbA1c unavailable');
    }
    if (latest && (latest as any).ldl == null) {
      confidence -= this.PENALTIES.missingLDL;
      missingInputs.push('LDL');
      reasons.push('LDL unavailable');
    }
    if (latest && (latest as any).creatinine == null) {
      confidence -= this.PENALTIES.missingCreatinine;
      missingInputs.push('Creatinine');
      reasons.push('Creatinine unavailable');
    }

    // ----- Outdated laboratory reports -----
    if (latest && (latest as any).date) {
      if (this.isOutdated((latest as any).date, 6)) {
        confidence -= this.PENALTIES.outdatedLab;
        reasons.push('Lab report older than 6 months');
        evidenceQuality.push('Outdated');
      }
    }

    // ----- Missing symptoms -----
    // Assuming a separate symptoms field exists on patient (not currently defined). We conservatively check presence.
    // If symptoms array is empty or undefined, apply penalty.
    const anySymptoms = (patient as any).symptoms as string[] | undefined;
    if (!anySymptoms || anySymptoms.length === 0) {
      confidence -= this.PENALTIES.missingSymptoms;
      missingInputs.push('Symptoms');
      reasons.push('No symptom data provided');
    }

    // ----- Unknown medication history -----
    if (!patient.medications || patient.medications.length === 0) {
      confidence -= this.PENALTIES.unknownMedicationHistory;
      missingInputs.push('Medication History');
      reasons.push('Medication history missing');
    }

    // ----- Contradicting inputs (simple heuristic) -----
    // Example: HbA1c very low but glucose high, etc.
    if (latest && (latest as any).hba1c && (latest as any).glucose) {
      const hba1c = (latest as any).hba1c;
      const glucose = (latest as any).glucose;
      if (hba1c < 5 && glucose > 150) {
        confidence -= this.PENALTIES.contradictoryInputs;
        reasons.push('Contradictory lab values (low HbA1c, high glucose)');
      }
    }

    // Ensure confidence does not drop below 0
    confidence = Math.max(0, confidence);

    // Derive confidence level
    let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (confidence >= 80) confidenceLevel = 'High';
    else if (confidence >= 50) confidenceLevel = 'Medium';

    const confidenceReason = reasons.join('; ') || 'All required data present';

    return {
      confidencePercentage: confidence,
      confidenceLevel,
      confidenceReason,
      missingInputs,
      estimatedValues,
      evidenceQuality,
    };
  }
}
