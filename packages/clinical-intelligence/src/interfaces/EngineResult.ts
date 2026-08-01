import { RiskSeverityTier } from '@healthsense/clinical-models';
import { DiseaseRiskResult, DiseaseId } from './RiskModel';
import { PatientSnapshot } from './PatientSnapshot';

export interface UnifiedRiskAssessment {
  patientId: string;
  evaluatedAt: string;
  overallHealthScore: number; // 0 to 100 (100 = best health, 0 = highest risk)
  overallRiskScore: number;   // 0 to 100 (0 = lowest risk, 100 = highest risk)
  overallTier: RiskSeverityTier;
  highestPriorityDisease: {
    diseaseId: string;
    diseaseName: string;
    riskScore: number;
    severityTier: RiskSeverityTier;
  };
  comorbidityIndex: number; // count of active comorbidities/high risk overlaps
  numberOfMissingInputs: number;
  overallConfidenceScore: number; // 0 to 1.0
  diseaseResults: Record<DiseaseId, DiseaseRiskResult>;
  snapshot: PatientSnapshot;
}
