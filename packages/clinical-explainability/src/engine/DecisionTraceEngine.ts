import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { DecisionPathBuilder } from '../services/DecisionPathBuilder';
import { DecisionTrace } from '../interfaces/ReasoningStep';

export class DecisionTraceEngine {
  public generateTrace(assessment: UnifiedRiskAssessment): DecisionTrace {
    return DecisionPathBuilder.buildDecisionTrace(assessment);
  }

  public generateTimeline(assessment: UnifiedRiskAssessment): { date: string; event: string; status: 'past' | 'current' | 'future' }[] {
    return DecisionPathBuilder.buildDecisionTimeline(assessment);
  }
}
