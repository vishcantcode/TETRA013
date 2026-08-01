import { PatientTimeline, ClinicalTrend, ClinicalEvent } from '../domain';

export class TrendAnalysisEngine {
  public analyze(timeline: PatientTimeline): ClinicalTrend[] {
    const trends: ClinicalTrend[] = [];

    // Group vital events by name
    const vitals = timeline.events.filter(e => e.type === 'vital');
    const groupedVitals: Record<string, ClinicalEvent[]> = {};
    
    vitals.forEach(v => {
      if (!groupedVitals[v.name]) groupedVitals[v.name] = [];
      groupedVitals[v.name].push(v);
    });

    for (const [metric, events] of Object.entries(groupedVitals)) {
      if (events.length < 2) continue;
      
      const first = events[0];
      const last = events[events.length - 1];
      
      const durationMs = last.timestamp.getTime() - first.timestamp.getTime();
      const valDiff = (last.value.value || 0) - (first.value.value || 0);
      const slope = valDiff / (durationMs || 1);

      let direction: ClinicalTrend['direction'] = 'stable';
      if (Math.abs(valDiff) > 0.05 * (first.value.value || 1)) {
         direction = valDiff > 0 ? 'worsening' : 'improving'; // Simplistic heuristic, e.g. blood pressure
         // Real engine would use ontology to know if higher is worse or better
      }

      trends.push({
        id: `trend-${Date.now()}-${Math.random()}`,
        type: 'vital',
        metric,
        direction,
        slope,
        confidence: events.length > 3 ? 0.9 : 0.6,
        durationMs,
        supportingEventIds: events.map(e => e.id)
      });
    }

    return trends;
  }
}
