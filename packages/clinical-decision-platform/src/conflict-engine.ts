import { DecisionConflict, DecisionAction } from './domain';

export class ConflictResolutionEngine {
  public resolveConflicts(actions: DecisionAction[]): { resolvedActions: DecisionAction[], conflicts: DecisionConflict[] } {
    const conflicts: DecisionConflict[] = [];
    const resolvedActions: DecisionAction[] = [];

    // Simple deterministic rule: remove duplicates based on action description
    const seenDescriptions = new Set<string>();

    for (const action of actions) {
      if (seenDescriptions.has(action.description)) {
        conflicts.push({
          id: `conflict-${Date.now()}-${Math.random()}`,
          description: `Duplicate action detected: ${action.description}`,
          involvedActions: [action.id],
          resolutionStrategy: 'merge'
        });
      } else {
        seenDescriptions.add(action.description);
        resolvedActions.push(action);
      }
    }

    // Example of a contradictory conflict:
    // If one action is "Prescribe X" and another is "Avoid X"
    const prescribeActions = resolvedActions.filter(a => a.description.toLowerCase().includes('prescribe'));
    const avoidActions = resolvedActions.filter(a => a.description.toLowerCase().includes('avoid'));

    for (const p of prescribeActions) {
      for (const a of avoidActions) {
        const pTarget = p.description.split(' ').pop();
        const aTarget = a.description.split(' ').pop();
        if (pTarget && aTarget && pTarget === aTarget) {
          conflicts.push({
            id: `conflict-${Date.now()}-${Math.random()}`,
            description: `Contradictory actions for ${pTarget}`,
            involvedActions: [p.id, a.id],
            resolutionStrategy: 'escalate'
          });
          // Remove the prescribing action for safety
          const index = resolvedActions.indexOf(p);
          if (index > -1) {
            resolvedActions.splice(index, 1);
          }
        }
      }
    }

    return { resolvedActions, conflicts };
  }
}
