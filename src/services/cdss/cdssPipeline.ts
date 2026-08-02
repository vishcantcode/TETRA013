import { Patient } from '../../types';
import { CdssPipelineResult } from '../../types/cdss';
import { PatientDataValidationService } from './validationService';
import { MlRiskPredictionService } from './mlRiskPredictionService';
import { ClinicalRuleEngine } from './clinicalRuleEngine';
import { EarlyWarningEngine } from './earlyWarningEngine';
import { ReferralEngine } from './referralEngine';
import { GeminiClinicalReasoningService } from './geminiReasoningService';
import { PatientEducationService } from './patientEducationService';
import { ConfidenceEngine } from './confidenceEngine';
import { ReportGeneratorService } from './reportGeneratorService';

export class CdssPipelineOrchestrator {
  /**
   * Executes the full 10-Stage Sequential Clinical Decision Support System (CDSS) Pipeline.
   * Stage 1: Data Validation
   * Stage 2: ML Risk Prediction
   * Stage 3: Feature Importance
   * Stage 4: Clinical Rule Engine
   * Stage 5: Early Warning Engine
   * Stage 6: Referral Engine
   * Stage 7: Gemini Clinical Reasoning
   * Stage 8: Patient Education
   * Stage 9: AI Confidence Calibration
   * Stage 10: Report Generation
   */
  public static async executePipeline(
    patient: Patient,
    customVitals?: any,
    doctorNotes?: string
  ): Promise<CdssPipelineResult> {
    // Stage 1: Data Validation
    const validation = PatientDataValidationService.validatePatientData(patient, customVitals);

    // Stage 2 & Stage 3: ML Risk Prediction & Feature Importance
    const mlService = MlRiskPredictionService.getInstance();
    const predictions = await mlService.predictRiskAsync(patient, customVitals);

    // Collect all top contributory features across all disease predictions
    const featureImportance = predictions.flatMap((p) => p.contributoryFeatures);

    // Stage 4: Evidence-Based Clinical Rule Engine
    const ruleEngine = ClinicalRuleEngine.evaluateRules(patient, customVitals);

    // Stage 5: Early Warning Progression Engine
    const earlyWarnings = EarlyWarningEngine.generateAlerts(patient, customVitals);

    // Stage 6: Specialist Referral Engine
    const referrals = ReferralEngine.generateReferrals(patient, customVitals);

    // Stage 7: Gemini Clinical Reasoning
    const geminiReasoning = await GeminiClinicalReasoningService.generateReasoning(
      patient,
      predictions,
      ruleEngine.recommendations,
      earlyWarnings,
      referrals,
      customVitals
    );

    // Stage 8: Patient Education (Doctor vs Patient language)
    const patientEducation = PatientEducationService.generateEducationContent(
      patient,
      customVitals
    );

    // Stage 9: AI Confidence Breakdown
    const confidence = ConfidenceEngine.calculateConfidence(patient, validation, customVitals);

    // Create preliminary pipeline result to construct report
    const preliminaryResult: CdssPipelineResult = {
      validation,
      predictions,
      featureImportance,
      ruleEngine,
      earlyWarnings,
      referrals,
      patientEducation,
      confidence,
      report: {} as any, // placeholder
      geminiReasoning,
    };

    // Stage 10: Report Generation
    const report = ReportGeneratorService.generateReport(patient, preliminaryResult, doctorNotes);

    preliminaryResult.report = report;

    return preliminaryResult;
  }
}
