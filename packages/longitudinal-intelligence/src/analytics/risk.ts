import { PatientTimeline, RiskEvolution } from '../domain';

export class RiskEvolutionEngine {
  public analyze(timeline: PatientTimeline): RiskEvolution[] {
    const evolutions: RiskEvolution[] = [];
    const snapshots = timeline.snapshots;

    if (snapshots.length < 2) {
      return evolutions;
    }

    const initial = snapshots[0].profile.risk.factors;
    const current = snapshots[snapshots.length - 1].profile.risk.factors;

    // Detect emerged risks
    current.forEach(f => {
      if (!initial.includes(f)) {
        evolutions.push({ riskFactor: f, state: 'emerging' });
      } else {
        evolutions.push({ riskFactor: f, state: 'stable' });
      }
    });

    // Detect resolved risks
    initial.forEach(f => {
      if (!current.includes(f)) {
        evolutions.push({ riskFactor: f, state: 'resolved' });
      }
    });

    return evolutions;
  }
}
