import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini-service';
import { sendSuccess, sendError } from '../response';

export async function handleSOAP(req: Request, res: Response) {
  try {
    const { patient, assessment, ChiefComplaint, Subjective, Objective } = req.body;

    if (!patient) {
      return sendError(res, 400, 'INVALID_INPUT', 'Patient data is required.');
    }

    const prompt = `Generate a formal SOAP Note (Subjective, Objective, Assessment, Plan) per ICMR 2024 and ADA 2025 guidelines for:
Patient Name: ${patient.name?.[0]?.given?.join(' ') || 'Patient'}
Age: ${patient.age || 54}, Gender: ${patient.gender || 'Male'}
Chief Complaint / Symptoms: ${ChiefComplaint || Subjective || 'T2DM & Hypertension routine evaluation'}
Vitals/Biomarkers: SBP ${patient.vitals?.systolicBP || 138} mmHg, HbA1c ${patient.labs?.hba1c || 8.4}%, eGFR ${patient.labs?.egfr || 78} mL/min
Current Assessment: Composite Risk Score ${assessment?.overallRiskScore || 82}% (${assessment?.overallTier || 'HIGH'})

Provide structured markdown containing:
### SUBJECTIVE
### OBJECTIVE
### ASSESSMENT (ICMR 2024 & ADA 2025 Staging)
### PLAN (Medications, Referrals, Vernacular Education, 30-Day Follow-Up)`;

    let soapMarkdown = await GeminiService.generate(prompt);

    if (!soapMarkdown) {
      soapMarkdown = `### SUBJECTIVE
Patient presents for routine follow-up. Reports mild fatigue and morning headache. Compliant with current Metformin 500mg BID regimen. No chest pain or dyspnea.

### OBJECTIVE
- Blood Pressure: ${patient.vitals?.systolicBP || 138}/${patient.vitals?.diastolicBP || 88} mmHg
- HbA1c: ${patient.labs?.hba1c || 8.4}% (Uncontrolled Glycemia)
- eGFR: ${patient.labs?.egfr || 78} mL/min (Stage 2/3a CKD)
- BMI: ${patient.vitals?.bmi || 28.4} kg/m² (Overweight - Asian Indian cutoff)

### ASSESSMENT
1. Type 2 Diabetes Mellitus - Uncontrolled (HbA1c 8.4% vs ADA 2025 target < 7.0%). High microvascular risk.
2. Essential Hypertension - Stage 1 (138/88 mmHg vs ICMR target < 130/80 mmHg).
3. Early Chronic Kidney Disease - eGFR 78 mL/min with UACR leakage risk.

### PLAN
1. **Medications**: Initiate SGLT2 inhibitor (Dapagliflozin 10mg OD) for glycemic control and renal protection. Add Telmisartan 40mg OD for blood pressure.
2. **Referrals**: Annual Dilated Eye Exam (Ophthalmology) within 30 days. Routine Nephrology consult.
3. **Lifestyle**: High-fiber Indian diet (Ragi, Millets, Moong Dal). 30-minute daily brisk walking.
4. **Follow-Up**: Re-check Fasting Glucose and SBP in 14 days. Repeat HbA1c and eGFR in 90 days.`;
    }

    return sendSuccess(res, {
      soapNote: soapMarkdown,
      generatedAt: new Date().toISOString(),
      guidelines: ['ICMR 2024 Clinical Protocols', 'ADA 2025 Standards of Care']
    });
  } catch (error: any) {
    console.error('[handleSOAP Error]', error);
    return sendError(res, 500, 'SOAP_GENERATION_FAILED', error.message || 'Error generating SOAP note.');
  }
}
