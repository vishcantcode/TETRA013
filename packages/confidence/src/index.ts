export interface ConfidenceResult {
  score: number;
  level: 'high' | 'medium' | 'low';
  explanation: string;
  requiresEscalation: boolean;
}

export class ConfidenceEngine {
  evaluate(ruleResults: any[], contextScore: number, aiOutputQuality: number): ConfidenceResult {
    let score = (contextScore * 0.4) + (aiOutputQuality * 0.6);
    if (ruleResults.some(r => r.action === 'escalate')) {
      score *= 0.5;
    }
    
    return {
      score,
      level: score > 0.8 ? 'high' : (score > 0.5 ? 'medium' : 'low'),
      explanation: `Confidence computed as ${score.toFixed(2)} based on context and rules.`,
      requiresEscalation: score < 0.5
    };
  }
}
