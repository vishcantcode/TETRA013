import { PatientTimeline, MedicationAdherenceProfile } from '../domain';

export class AdherenceIntelligenceEngine {
  public generate(timeline: PatientTimeline): MedicationAdherenceProfile[] {
    const profiles: MedicationAdherenceProfile[] = [];
    const lastSnapshot = timeline.snapshots[timeline.snapshots.length - 1];
    if (lastSnapshot && lastSnapshot.profile && lastSnapshot.profile.medications) {
      const baseAdherence = lastSnapshot.profile.behavior?.adherenceScore || 80;

      lastSnapshot.profile.medications.forEach((m: any) => {
        profiles.push({
          medicationName: m.name || 'Medication',
          score: baseAdherence,
          trend: 'stable'
        });
      });
    }

    return profiles;
  }
}
