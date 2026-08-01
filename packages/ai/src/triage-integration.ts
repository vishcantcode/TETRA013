import { IntelligencePipeline } from './pipeline';
import { TriageSession, TriageResult } from '@healthsense/clinical-models';

export class TriageIntelligenceIntegration {
  constructor(private pipeline: IntelligencePipeline) {}

  async processTriageCompletion(session: TriageSession, profile: any): Promise<TriageResult> {
    const rawInputs = session.symptoms.map(s => ({
      type: 'symptom',
      value: s.symptom,
      timestamp: s.timestamp,
      source: 'patient_triage'
    }));

    const result = await this.pipeline.execute(rawInputs, profile);
    
    return {
      sessionId: session.id,
      recommendation: result.decision.recommendation,
      isEmergency: result.decision.isEscalated,
      confidence: result.decision.confidenceScore,
      explanation: result.explanation
    };
  }
}
