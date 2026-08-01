import { PatientTimeline, RiskEvolution } from '../domain';

export class RiskEvolutionEngine {
  public analyze(timeline: PatientTimeline): RiskEvolution[] {
    const evolutions: RiskEvolution[] = [];
    const snapshots = timeline.snapshots;

    if (snapshots.length < 2) {
      return evolutions;
    }

    const initial: string[] = snapshots[0]?.profile?.risk?.factors || [];
    const current: string[] = snapshots[snapshots.length - 1]?.profile?.risk?.factors || [];

    // Detect emerged risks
    current.forEach((f: string) => {
      if (!initial.includes(f)) {
        evolutions.push({ riskFactor: f, state: 'emerging' });
      } else {
        evolutions.push({ riskFactor: f, state: 'stable' });
      }
    });

    // Detect resolved risks
    initial.forEach((f: string) => {
      if (!current.includes(f)) {
        evolutions.push({ riskFactor: f, state: 'resolved' });
      }
    });

    return evolutions;
  }
}
