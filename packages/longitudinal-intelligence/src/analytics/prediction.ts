import { PatientTimeline, PredictionSignal } from '../domain';

export class PredictionEngine {
  public identifySignals(timeline: PatientTimeline): PredictionSignal[] {
    const signals: PredictionSignal[] = [];

    // Simple deterministic heuristic: if multiple encounters for the same diagnosis exist over time, 
    // we may have recurring deterioration or intervention fatigue.
    const encounters = timeline.events.filter(e => e.type === 'encounter');
    const diagnoses = encounters.map(e => e.value.diagnosis).filter(Boolean);
    
    const freq: Record<string, number> = {};
    diagnoses.forEach(d => { freq[d] = (freq[d] || 0) + 1; });

    Object.entries(freq).forEach(([diagnosis, count]) => {
      if (count > 2) {
        signals.push({
          type: 'recurring_deterioration',
          description: `Patient has had ${count} encounters for ${diagnosis}`,
          confidence: 0.85
        });
      }
    });

    return signals;
  }
}
