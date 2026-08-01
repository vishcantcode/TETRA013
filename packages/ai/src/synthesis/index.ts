export interface DecisionRecord {
  id: string;
  recommendation: string;
  confidenceScore: number;
  isEscalated: boolean;
  timestamp: Date;
}

export class DecisionSynthesisEngine {
  synthesize(aiOutput: string, rules: any[], safetyPassed: boolean, confidence: any): DecisionRecord {
    if (!safetyPassed) {
      return { id: crypto.randomUUID(), recommendation: 'Safety block: Please consult a doctor immediately.', confidenceScore: 0, isEscalated: true, timestamp: new Date() };
    }
    
    const escalate = rules.some(r => r.action === 'escalate') || confidence.requiresEscalation;
    
    return {
      id: crypto.randomUUID(),
      recommendation: aiOutput,
      confidenceScore: confidence.score,
      isEscalated: escalate,
      timestamp: new Date()
    };
  }
}
