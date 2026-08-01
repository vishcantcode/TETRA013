import { PatientTimeline, ClinicalTrend, Trajectory } from '../domain';

export class TrajectoryEngine {
  public infer(timeline: PatientTimeline, trends: ClinicalTrend[]): Trajectory[] {
    const trajectories: Trajectory[] = [];

    // Synthesize overall clinical trajectory from trends
    const worseningTrends = trends.filter(t => t.direction === 'worsening');
    const improvingTrends = trends.filter(t => t.direction === 'improving');

    let state: Trajectory['state'] = 'stable';
    let confidence = 0.5;

    if (worseningTrends.length > improvingTrends.length && worseningTrends.length > 0) {
      state = 'deteriorating';
      confidence = Math.min(1.0, 0.5 + (worseningTrends.length * 0.1));
    } else if (improvingTrends.length > worseningTrends.length && improvingTrends.length > 0) {
      state = 'improving';
      confidence = Math.min(1.0, 0.5 + (improvingTrends.length * 0.1));
    }

    trajectories.push({
      id: `traj-${Date.now()}`,
      type: 'clinical',
      state,
      confidence,
      evidence: trends.map(t => t.id)
    });

    return trajectories;
  }
}
