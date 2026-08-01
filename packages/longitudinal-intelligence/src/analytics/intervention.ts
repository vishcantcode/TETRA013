import { PatientTimeline, ClinicalTrend, InterventionEffect } from '../domain';

export class InterventionEffectivenessEngine {
  public evaluate(timeline: PatientTimeline, trends: ClinicalTrend[]): InterventionEffect[] {
    const effects: InterventionEffect[] = [];

    const medications = timeline.events.filter(e => e.type === 'medication' && e.value.active);

    medications.forEach(med => {
      // Find trends related to or following this medication
      const subsequentTrends = trends;

      let effectState: InterventionEffect['effect'] = 'unknown';
      let confidence = 0.5;

      if (subsequentTrends.length > 0) {
        // Calculate aggregate direction
        const improving = subsequentTrends.filter(t => t.direction === 'improving').length;
        const worsening = subsequentTrends.filter(t => t.direction === 'worsening').length;

        if (improving > worsening) {
          effectState = 'positive';
          confidence = 0.8 + (0.1 * (improving / subsequentTrends.length));
        } else if (worsening > improving) {
          effectState = 'negative';
          confidence = 0.8 + (0.1 * (worsening / subsequentTrends.length));
        } else {
           effectState = 'neutral';
           confidence = 0.6;
        }
      }

      effects.push({
        interventionId: med.id,
        name: med.name,
        effect: effectState,
        correlationConfidence: Math.min(confidence, 0.99)
      });
    });

    return effects;
  }
}
