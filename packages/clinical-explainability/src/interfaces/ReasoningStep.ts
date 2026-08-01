import { GuidelineCitation } from './Evidence';

export interface ReasoningStep {
  stepNumber: number;
  stage: 'Patient Intake' | 'Biomarker Ingestion' | 'Guideline Evaluation' | 'Risk Stratification' | 'Clinical Action';
  title: string;
  description: string;
  findingValue?: string | number;
  citation?: GuidelineCitation;
  timestamp?: string;
}

export interface DecisionTrace {
  traceId: string;
  patientId: string;
  createdAt: string;
  steps: ReasoningStep[];
  outcomeSummary: string;
}
