import { DecisionEvidence, ClinicalDecision } from './domain';
import { DecisionSynthesisEngine } from './synthesis';

export class DecisionAggregationPipeline {
  private synthesisEngine = new DecisionSynthesisEngine();
  private evidenceGraph: DecisionEvidence[] = [];

  public addEvidence(evidence: DecisionEvidence) {
    this.evidenceGraph.push(evidence);
  }

  public clearEvidence() {
    this.evidenceGraph = [];
  }

  public generateDecision(patientId: string, sessionId: string): ClinicalDecision {
    if (this.evidenceGraph.length === 0) {
      throw new Error("Cannot generate decision without evidence.");
    }
    const decision = this.synthesisEngine.synthesize(patientId, sessionId, this.evidenceGraph);
    return decision;
  }
}
