import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { FeatureExtractor } from '../utils/FeatureExtractor';
import { RiskEngine } from './RiskEngine';
import { RiskAggregator } from '../services/RiskAggregator';
import { UnifiedRiskAssessment } from '../interfaces/EngineResult';

export class ClinicalEngine {
  private riskEngine = new RiskEngine();

  public evaluatePatient(
    patient: FHIRPatient,
    vitals: FHIRObservation[] = [],
    labs: FHIRObservation[] = [],
    conditions: FHIRCondition[] = [],
    medications: FHIRMedicationRequest[] = [],
    reports: FHIRDiagnosticReport[] = []
  ): UnifiedRiskAssessment {
    // Step 1: Create PatientSnapshot & Feature Extraction
    const snapshot = FeatureExtractor.createSnapshot(patient, vitals, labs, conditions, medications, reports);

    // Step 2: Evaluate 5-Disease Risk Models
    const diseaseResultsMap = this.riskEngine.evaluateAllRisks(snapshot.features);

    // Step 3: Aggregate into Unified Risk Assessment
    return RiskAggregator.aggregate(snapshot, diseaseResultsMap);
  }
}

export const clinicalEngine = new ClinicalEngine();
