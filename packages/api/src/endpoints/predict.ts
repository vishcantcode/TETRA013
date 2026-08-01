import { Request, Response } from 'express';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '@healthsense/clinical-explainability';
import { GeminiService } from '../services/gemini-service';
import { sendSuccess, sendError } from '../response';

const clinicalEngine = new ClinicalEngine();
const explainabilityEngine = new ExplainabilityEngine();

export async function handlePredict(req: Request, res: Response) {
  try {
    const { patient, vitals = [], labs = [], conditions = [], medications = [], reports = [] } = req.body;

    if (!patient || !patient.id) {
      return sendError(res, 400, 'INVALID_INPUT', 'Patient data with valid ID is required.');
    }

    // Step 1: Run deterministic engine across all 9 diseases
    const assessment = clinicalEngine.evaluatePatient(patient, vitals, labs, conditions, medications, reports);
    const explainabilityReport = explainabilityEngine.generateReport(assessment);

    // Step 2: Optionally enhance reasoning with Gemini LLM if key is present
    let aiSynthesis = null;
    if (GeminiService) {
      const prompt = `Patient Summary: Age ${assessment.snapshot.features.age}, Gender ${assessment.snapshot.features.gender}.
HbA1c: ${assessment.snapshot.features.hba1c ?? 'N/A'}%, SBP: ${assessment.snapshot.features.systolicBP ?? 'N/A'} mmHg, eGFR: ${assessment.snapshot.features.egfr ?? 'N/A'} mL/min, BMI: ${assessment.snapshot.features.bmi ?? 'N/A'}.
Top disease risks:
- Diabetes: ${assessment.diseaseResults.diabetes.riskScore}% (${assessment.diseaseResults.diabetes.severityTier})
- Hypertension: ${assessment.diseaseResults.hypertension.riskScore}% (${assessment.diseaseResults.hypertension.severityTier})
- CKD: ${assessment.diseaseResults.ckd.riskScore}% (${assessment.diseaseResults.ckd.severityTier})
- CVD: ${assessment.diseaseResults.cvd.riskScore}% (${assessment.diseaseResults.cvd.severityTier})
- Stroke: ${assessment.diseaseResults.stroke.riskScore}% (${assessment.diseaseResults.stroke.severityTier})
- Metabolic Syndrome: ${assessment.diseaseResults.metabolic_syndrome.riskScore}%
- Diabetic Neuropathy: ${assessment.diseaseResults.diabetic_neuropathy.riskScore}%
- Diabetic Retinopathy: ${assessment.diseaseResults.diabetic_retinopathy.riskScore}%
- Heart Failure: ${assessment.diseaseResults.heart_failure.riskScore}%

Provide a 2-paragraph clinical synthesis grounded in ICMR 2024 & ADA 2025 guidelines.`;

      aiSynthesis = await GeminiService.generate(prompt, 'You are an expert Clinical Decision Support AI Assistant.');
    }

    return sendSuccess(res, {
      assessment,
      explainabilityReport,
      aiSynthesis: aiSynthesis || explainabilityReport.clinicianNarrative,
      guidelinesUsed: ['ICMR 2024 Guidelines for Non-Communicable Diseases', 'ADA 2025 Standards of Care in Diabetes', 'KDIGO 2023 CKD Guidelines']
    });
  } catch (error: any) {
    console.error('[handlePredict Error]', error);
    return sendError(res, 500, 'PREDICTION_FAILED', error.message || 'Error processing clinical prediction.');
  }
}
