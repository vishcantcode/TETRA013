export interface Explanation {
  clinician: string;
  patient: string;
  evidenceUsed: string[];
}

export class ExplainabilityEngine {
  generate(decision: any, rules: any[], confidence: any): Explanation {
    return {
      clinician: `Decision made due to ${rules.length} rules triggered. Confidence: ${confidence.score}`,
      patient: `Based on your symptoms, we recommend ${decision.recommendation}.`,
      evidenceUsed: ['Patient History', 'Current Symptoms']
    };
  }
}
