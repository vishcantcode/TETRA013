import { DecisionAction, DecisionSeverity, DecisionPriority } from './domain';

export class DecisionPrioritizationEngine {
  public prioritizeActions(actions: DecisionAction[]): DecisionAction[] {
    // Simple deterministic ordering based on keywords
    return actions.sort((a, b) => {
      const scoreA = this.calculateUrgencyScore(a);
      const scoreB = this.calculateUrgencyScore(b);
      return scoreB - scoreA; // descending
    });
  }

  private calculateUrgencyScore(action: DecisionAction): number {
    const desc = action.description.toLowerCase();
    if (desc.includes('emergency') || desc.includes('immediate')) return 100;
    if (desc.includes('urgent') || desc.includes('asap')) return 80;
    if (desc.includes('prescribe') || desc.includes('medication')) return 60;
    if (desc.includes('review') || desc.includes('monitor')) return 40;
    return 20; // routine
  }

  public determineSeverity(actions: DecisionAction[]): DecisionSeverity {
    const maxScore = Math.max(...actions.map(a => this.calculateUrgencyScore(a)));
    if (maxScore >= 100) return 'critical';
    if (maxScore >= 80) return 'high';
    if (maxScore >= 60) return 'moderate';
    return 'low';
  }

  public determinePriority(actions: DecisionAction[]): DecisionPriority {
    const maxScore = Math.max(...actions.map(a => this.calculateUrgencyScore(a)));
    if (maxScore >= 100) return 'emergency';
    if (maxScore >= 80) return 'urgent';
    return 'routine';
  }
}
