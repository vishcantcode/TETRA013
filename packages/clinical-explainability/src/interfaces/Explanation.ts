import { DiseaseFeatureAttribution } from './FeatureContribution';
import { GuidelineCitation } from './Evidence';
import { DecisionTrace } from './ReasoningStep';
import { ConfidenceBreakdown } from './Confidence';

export interface CompleteExplainabilityReport {
  patientId: string;
  generatedAt: string;
  clinicianNarrative: string;
  patientVernacularSummaries: {
    en: string;
    hi: string;
    gu: string;
    ta?: string;
  };
  diseaseAttributions: Record<string, DiseaseFeatureAttribution>;
  guidelineCitations: GuidelineCitation[];
  decisionTrace: DecisionTrace;
  confidenceBreakdown: ConfidenceBreakdown;
  decisionTimeline: { date: string; event: string; status: 'past' | 'current' | 'future' }[];
}
