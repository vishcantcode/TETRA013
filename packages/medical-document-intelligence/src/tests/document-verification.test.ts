import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { DocumentIntelligenceEngine } from '../engine/DocumentIntelligenceEngine';

export async function runDocumentVerification() {
  const engine = new DocumentIntelligenceEngine();
  const demoPatient = DEMO_PATIENTS['patient-diabetes'].patient;

  const mockPayload = {
    documentId: 'doc-lab-001',
    patientId: demoPatient.id,
    fileName: 'ramesh_patel_lab_report.pdf',
    fileType: 'pdf' as const,
    uploadedAt: new Date().toISOString(),
    rawTextContent: `
CIVIL HOSPITAL LABORATORY REPORT
Date: 2026-07-25
Patient Name: Ramesh Patel (54M)

HbA1c: 8.4 %
Fasting Glucose: 164 mg/dL
eGFR: 78 mL/min
Blood Pressure: 138/88 mmHg
    `.trim()
  };

  const result = await engine.processDocumentAndEvaluate(mockPayload, demoPatient);

  return {
    documentId: result.documentId,
    category: result.category,
    extractedObsCount: result.extractedObservations.length,
    extractedLoincCodes: result.extractedObservations.map(o => o.code.coding[0]?.code),
    overallRiskScore: result.unifiedRiskAssessment.overallRiskScore,
    overallTier: result.unifiedRiskAssessment.overallTier,
    highestPriorityDisease: result.unifiedRiskAssessment.highestPriorityDisease.diseaseName
  };
}
