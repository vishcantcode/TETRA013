import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ClinicalNarrativeService } from '../services/ClinicalNarrativeService';
import { ConfidenceCalibrationService } from '../services/ConfidenceCalibrationService';
import { ConfidenceBreakdown } from '../interfaces/Confidence';

export class ReasoningEngine {
  public generateNarratives(assessment: UnifiedRiskAssessment): { clinicianNarrative: string; patientVernacularSummaries: { en: string; hi: string; gu: string } } {
    return {
      clinicianNarrative: ClinicalNarrativeService.generateClinicianNarrative(assessment),
      patientVernacularSummaries: ClinicalNarrativeService.generateVernacularSummaries(assessment)
    };
  }

  public calibrateConfidence(assessment: UnifiedRiskAssessment): ConfidenceBreakdown {
    return ConfidenceCalibrationService.calibrateConfidence(assessment);
  }
}
