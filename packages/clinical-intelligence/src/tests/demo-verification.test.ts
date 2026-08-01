import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { ClinicalEngine } from '../engine/ClinicalEngine';

export function runDemoVerification() {
  const engine = new ClinicalEngine();
  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const assessment = engine.evaluatePatient(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    results[key] = {
      patientName: bundle.patient.name[0]?.text,
      overallRiskScore: assessment.overallRiskScore,
      overallTier: assessment.overallTier,
      highestPriorityDisease: assessment.highestPriorityDisease.diseaseName,
      diabetesRisk: assessment.diseaseResults.diabetes.riskScore,
      hypertensionRisk: assessment.diseaseResults.hypertension.riskScore,
      ckdRisk: assessment.diseaseResults.ckd.riskScore,
      cvdRisk: assessment.diseaseResults.cvd.riskScore,
      strokeRisk: assessment.diseaseResults.stroke.riskScore,
      missingInputsCount: assessment.numberOfMissingInputs,
      confidence: assessment.overallConfidenceScore
    };
  }

  return results;
}
