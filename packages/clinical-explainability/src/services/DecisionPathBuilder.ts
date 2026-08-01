import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { DecisionTrace, ReasoningStep } from '../interfaces/ReasoningStep';

export class DecisionPathBuilder {
  public static buildDecisionTrace(assessment: UnifiedRiskAssessment): DecisionTrace {
    const f = assessment.snapshot.features;
    const steps: ReasoningStep[] = [];
    let stepCount = 1;

    // Step 1: Patient Intake
    steps.push({
      stepNumber: stepCount++,
      stage: 'Patient Intake',
      title: 'Patient Profile Ingested',
      description: `Ingested profile for Patient ${assessment.patientId} (Age ${f.age}, ${f.gender}).`,
      timestamp: assessment.evaluatedAt
    });

    // Step 2: Biomarker Ingestion
    if (f.hba1c !== null) {
      steps.push({
        stepNumber: stepCount++,
        stage: 'Biomarker Ingestion',
        title: 'Glycemic Biomarker Extracted',
        description: `HbA1c observed at ${f.hba1c}%.`,
        findingValue: `${f.hba1c}%`
      });
    }

    if (f.systolicBP !== null) {
      steps.push({
        stepNumber: stepCount++,
        stage: 'Biomarker Ingestion',
        title: 'Blood Pressure Extracted',
        description: `Systolic BP observed at ${f.systolicBP} mmHg.`,
        findingValue: `${f.systolicBP} mmHg`
      });
    }

    // Step 3: Guideline Evaluation & Stratification
    steps.push({
      stepNumber: stepCount++,
      stage: 'Risk Stratification',
      title: 'Multi-Disease Risk Evaluation',
      description: `Assessed 5 lifestyle disease models. Highest priority: ${assessment.highestPriorityDisease.diseaseName} (${assessment.highestPriorityDisease.riskScore}% risk).`
    });

    // Step 4: Clinical Action Output
    steps.push({
      stepNumber: stepCount++,
      stage: 'Clinical Action',
      title: 'Clinical Recommendations & Follow-Up',
      description: `Generated clinical summary and evidence-backed action plan with ${assessment.numberOfMissingInputs} missing test alerts.`
    });

    return {
      traceId: `trace-${Date.now()}`,
      patientId: assessment.patientId,
      createdAt: assessment.evaluatedAt,
      steps,
      outcomeSummary: `Patient overall risk classified as ${assessment.overallTier.toUpperCase()} (${assessment.overallRiskScore}% score).`
    };
  }

  public static buildDecisionTimeline(assessment: UnifiedRiskAssessment): { date: string; event: string; status: 'past' | 'current' | 'future' }[] {
    const dateStr = assessment.evaluatedAt.split('T')[0];
    return [
      { date: '2025-07-20', event: 'Historical Baseline Encounter', status: 'past' },
      { date: dateStr, event: 'CDSS Multi-Disease Evaluation & Risk Scoring', status: 'current' },
      { date: '2026-08-30', event: 'Scheduled 30-Day Clinical & Biomarker Follow-Up', status: 'future' }
    ];
  }
}
