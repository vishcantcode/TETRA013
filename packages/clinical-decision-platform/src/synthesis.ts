import { 
  ClinicalDecision, 
  DecisionEvidence, 
  DecisionRecommendation, 
  DecisionExplanation, 
  DecisionConfidence, 
  DecisionAction,
  DecisionOutcome
} from './domain';
import { ConflictResolutionEngine } from './conflict-engine';
import { DecisionPrioritizationEngine } from './priority-engine';

export class DecisionSynthesisEngine {
  private conflictEngine = new ConflictResolutionEngine();
  private priorityEngine = new DecisionPrioritizationEngine();

  public synthesize(
    patientId: string, 
    sessionId: string, 
    evidenceGraph: DecisionEvidence[]
  ): ClinicalDecision {
    
    // 1. Extract all suggested actions from evidence
    let allActions: DecisionAction[] = [];
    evidenceGraph.forEach(evidence => {
      if (evidence.data && evidence.data.actions) {
        allActions = allActions.concat(evidence.data.actions);
      }
    });

    // 2. Resolve conflicts
    const { resolvedActions, conflicts } = this.conflictEngine.resolveConflicts(allActions);

    // 3. Prioritize
    const prioritizedActions = this.priorityEngine.prioritizeActions(resolvedActions);
    const severity = this.priorityEngine.determineSeverity(prioritizedActions);
    const priority = this.priorityEngine.determinePriority(prioritizedActions);

    // 4. Group into recommendations
    const recommendations: DecisionRecommendation[] = [
      {
        id: `rec-${Date.now()}`,
        category: 'triage', // simplified for demo
        severity,
        priority,
        actions: prioritizedActions,
        contraindications: []
      }
    ];

    // 5. Compute aggregate confidence
    const avgConfidence = evidenceGraph.reduce((acc, ev) => acc + ev.confidence, 0) / (evidenceGraph.length || 1);
    const confidence: DecisionConfidence = {
      overallScore: avgConfidence,
      factors: ['Evidence Consistency', 'Resolved Conflicts Count: ' + conflicts.length],
      isActionable: avgConfidence > 0.7 && conflicts.every(c => c.resolutionStrategy !== 'escalate')
    };

    // 6. Generate Explanation
    const explanation: DecisionExplanation = {
      patientFriendlySummary: 'We have compiled a unified plan based on your recent symptoms, chronic conditions, and preventive profile.',
      clinicalRationale: 'Aggregated findings from ' + evidenceGraph.map(e => e.sourceEngine).join(', '),
      evidenceChain: evidenceGraph.map(e => `${e.sourceEngine} at ${e.timestamp.toISOString()}`),
      conflictResolutions: conflicts.map(c => `Resolved: ${c.description} via ${c.resolutionStrategy}`)
    };

    // 7. Define outcomes
    const outcomes: DecisionOutcome[] = [
      {
        id: `out-${Date.now()}`,
        predictedEffect: 'Stabilization of active conditions.',
        monitoringRequirements: ['Follow up in 7 days']
      }
    ];

    return new ClinicalDecision(
      `decision-${Date.now()}`,
      {
        generatedAt: new Date(),
        version: '1.0.0',
        patientId,
        sessionId
      },
      recommendations,
      explanation,
      confidence,
      evidenceGraph,
      conflicts,
      outcomes
    );
  }
}
