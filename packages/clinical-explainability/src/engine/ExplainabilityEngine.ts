import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { CompleteExplainabilityReport } from '../interfaces/Explanation';
import { FeatureImportanceService } from '../services/FeatureImportanceService';
import { GuidelineCitationService } from '../services/GuidelineCitationService';
import { ConfidenceCalibrationService } from '../services/ConfidenceCalibrationService';
import { ClinicalNarrativeService } from '../services/ClinicalNarrativeService';
import { DecisionPathBuilder } from '../services/DecisionPathBuilder';

export class ExplainabilityEngine {
  public generateReport(assessment: UnifiedRiskAssessment): CompleteExplainabilityReport {
    // 1. Compute SHAP-style Feature Importance for all 5 diseases
    const diseaseAttributions = FeatureImportanceService.computeDiseaseAttributions(assessment.diseaseResults);

    // 2. Extract Guideline Lineage Citations
    const guidelineCitations = GuidelineCitationService.extractCitations(assessment);

    // 3. Calibrate Overall System Confidence
    const confidenceBreakdown = ConfidenceCalibrationService.calibrateConfidence(assessment);

    // 4. Synthesize Clinical Narratives & Multilingual Patient Summaries
    const clinicianNarrative = ClinicalNarrativeService.generateClinicianNarrative(assessment);
    const patientVernacularSummaries = ClinicalNarrativeService.generateVernacularSummaries(assessment);

    // 5. Build Decision Trace & Timeline
    const decisionTrace = DecisionPathBuilder.buildDecisionTrace(assessment);
    const decisionTimeline = DecisionPathBuilder.buildDecisionTimeline(assessment);

    return {
      patientId: assessment.patientId,
      generatedAt: new Date().toISOString(),
      clinicianNarrative,
      patientVernacularSummaries,
      diseaseAttributions,
      guidelineCitations,
      decisionTrace,
      confidenceBreakdown,
      decisionTimeline
    };
  }
}

export const explainabilityEngine = new ExplainabilityEngine();
