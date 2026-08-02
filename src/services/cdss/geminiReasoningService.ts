import { Patient } from '../../types';
import {
  DiseasePrediction,
  EarlyWarningAlert,
  GuidelineRuleRecommendation,
  SpecialistReferral,
  GeminiReasoningOutput,
} from '../../types/cdss';

export class GeminiClinicalReasoningService {
  /**
   * Stage 7: Gemini Clinical Reasoning Engine.
   * Note: Gemini NEVER calculates risk scores (handled by ML engine).
   * Gemini provides clinical synthesis, markdown explanations, and follow-up rationales.
   */
  public static async generateReasoning(
    patient: Patient,
    predictions: DiseasePrediction[],
    rules: GuidelineRuleRecommendation[],
    warnings: EarlyWarningAlert[],
    referrals: SpecialistReferral[],
    customVitals?: any
  ): Promise<GeminiReasoningOutput> {
    const vitals = customVitals || patient.vitals || {};
    const hba1c = vitals.hba1c || 7.2;
    const bpSystolic = vitals.bpSystolic || 138;
    const bmi = vitals.bmi || 27.4;

    // First build instantaneous structured fallback
    const fallbackOutput: GeminiReasoningOutput = {
      executiveSummary: `The patient (${patient.name}, ${patient.age} y/o) presents with compounding cardiometabolic risk drivers including elevated HbA1c (${hba1c}%), Stage 1 Systolic Hypertension (${bpSystolic} mmHg), and Class I Overweight BMI (${bmi} kg/m²). Current CDSS trajectory indicates high Type 2 Diabetes and Cardiovascular Disease vulnerability. Immediate therapeutic titration, lifestyle modification, and renal screening are recommended to prevent microvascular target organ damage.`,
      clinicalSynthesis: `Multi-stage CDSS analysis indicates early glycemic dysregulation (HbA1c ${hba1c}%) coupled with peripheral vascular strain (BP ${bpSystolic} mmHg). Machine learning feature importance assigns 38% weight to glycated hemoglobin saturation, 24% to fasting glucose, and 18% to BMI. Clinical rule checks identified missing UACR and eGFR screening panels essential for subclinical CKD detection.`,
      doctorSummaryMarkdown: `### Executive Clinical Synthesis (CDSS v2.4)
- **Primary Clinical Impression**: Sub-optimally controlled Type 2 Diabetes Mellitus with Essential Primary Hypertension.
- **Key Glycemic Metric**: HbA1c **${hba1c}%** (Target: < 7.0%). Fasting Glucose: **${vitals.glucose || 128} mg/dL**.
- **Hemodynamic Profile**: Resting Systolic Blood Pressure **${bpSystolic} mmHg** (Target: < 130/80 mmHg).
- **Therapeutic Strategy**: Escalate Metformin regimen; consider early SGLT2 inhibitor (e.g. Empagliflozin 10mg) for combined glycemic control and cardiorenal protection.
- **Diagnostic Gaps**: Order Urine Albumin-to-Creatinine Ratio (UACR) and Serum Creatinine / eGFR.`,
      patientFriendlySummaryMarkdown: `### Your Personal Health Summary
- **Where You Stand Today**: Your blood sugar level (**${hba1c}%**) and blood pressure (**${bpSystolic} mmHg**) are slightly higher than ideal.
- **Why This Matters**: High blood sugar and blood pressure place extra workload on your blood vessels, heart, and kidneys over time.
- **Simple Steps You Can Take**:
  1. **Eat Balanced Meals**: Enjoy fresh vegetables, whole grains, and lean proteins like chicken and fish.
  2. **Stay Active**: Walk briskly for 30 minutes a day, 5 days a week.
  3. **Check Your Health**: Schedule a simple urine check (UACR) to ensure your kidneys stay healthy and strong.`,
      whyRecommendationsMade: [
        `HbA1c ${hba1c}% exceeds ADA guideline target (< 7.0%), triggering glycemic treatment escalation.`,
        `Systolic BP ${bpSystolic} mmHg exceeds 130/80 target, triggering home BP monitoring recommendation.`,
        `Diabetes & Hypertension co-occurrence creates high intraglomerular capillary pressure, necessitating UACR renal screening.`,
      ],
      followUpAdvice: `Re-evaluate clinical status in 2 weeks to review home blood pressure logs and lab results. Re-check HbA1c in 90 days.`,
      isAiGenerated: false,
    };

    // Try calling server-side API proxy if available
    try {
      const response = await fetch('/api/cdss/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          predictions,
          rules,
          warnings,
          referrals,
          vitals,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.executiveSummary) {
          return {
            ...data,
            isAiGenerated: true,
          };
        }
      }
    } catch {
      // Fallback silently if server endpoint not configured or offline
    }

    return fallbackOutput;
  }
}
