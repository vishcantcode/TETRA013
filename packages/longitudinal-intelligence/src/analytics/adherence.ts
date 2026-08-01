import { PatientTimeline, MedicationAdherenceProfile } from '../domain';

export class AdherenceIntelligenceEngine {
  public generate(timeline: PatientTimeline): MedicationAdherenceProfile[] {
    const profiles: MedicationAdherenceProfile[] = [];
    // Base implementation. Digital Twin profile behavior indicates 
    // a base adherence score. We can apply it.
    
    // Simplistic extraction logic from timeline snapshots
    const lastSnapshot = timeline.snapshots[timeline.snapshots.length - 1];
    if (lastSnapshot) {
      const baseAdherence = lastSnapshot.profile.behavior.adherenceScore;
      
      lastSnapshot.profile.medications.forEach(m => {
        profiles.push({
          medicationName: m.name,
          score: baseAdherence || 80, // Fallback default
          trend: 'stable'
        });
      });
    }

    return profiles;
  }
}
