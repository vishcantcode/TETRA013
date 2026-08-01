import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '../engine/ExplainabilityEngine';

export function runExplainabilityVerification() {
  const clinicalEngine = new ClinicalEngine();
  const explainabilityEngine = new ExplainabilityEngine();

  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const assessment = clinicalEngine.evaluatePatient(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    const report = explainabilityEngine.generateReport(assessment);

    results[key] = {
      patientId: report.patientId,
      clinicianNarrative: report.clinicianNarrative,
      vernacularEn: report.patientVernacularSummaries.en,
      vernacularHi: report.patientVernacularSummaries.hi,
      vernacularGu: report.patientVernacularSummaries.gu,
      citationsCount: report.guidelineCitations.length,
      citations: report.guidelineCitations.map(c => `[${c.source}] ${c.title} (${c.section})`),
      traceStepsCount: report.decisionTrace.steps.length,
      confidenceText: report.confidenceBreakdown.percentageText,
      confidenceScore: report.confidenceBreakdown.overallConfidenceScore,
      topAttributionDiabetes: report.diseaseAttributions.diabetes.topPositiveContributors[0]?.featureName || 'None'
    };
  }

  return results;
}
