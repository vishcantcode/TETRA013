import { PatientTimeline, ClinicalEvent, TimelineMetadata } from './domain';

export class TimelineEngine {
  public reconstruct(twin: any): PatientTimeline {
    const events: ClinicalEvent[] = [];
    const snapshots = twin?.snapshots || [];

    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return {
        patientId: twin?.patientId || twin?.patient_id || 'anonymous',
        metadata: { reconstructedAt: new Date(), snapshotCount: 0, timeRange: { start: new Date(), end: new Date() } },
        events: [],
        snapshots: []
      };
    }

    // Sort snapshots chronologically
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.timestamp || Date.now()).getTime() - new Date(b.timestamp || Date.now()).getTime());

    sortedSnapshots.forEach(snap => {
      const profile = snap?.profile || {};
      const clinicalHistory = snap?.clinicalHistory || snap?.clinical_history || {};

      // Extract symptoms
      profile.symptoms?.forEach((s: any) => {
        events.push({
          id: `sym-${s.id || Math.random()}-${snap.version || 1}`,
          type: 'symptom',
          name: s.symptom || 'Symptom',
          timestamp: new Date(s.date || snap.timestamp || Date.now()),
          value: { resolved: !!s.resolved }
        });
      });

      // Extract vitals
      profile.vitals?.forEach((v: any) => {
        events.push({
          id: `vit-${v.id || Math.random()}-${snap.version || 1}`,
          type: 'vital',
          name: v.type || 'Vital',
          timestamp: new Date(v.date || snap.timestamp || Date.now()),
          value: { value: v.value, unit: v.unit }
        });
      });

      // Extract encounters
      clinicalHistory.encounters?.forEach((e: any, idx: number) => {
        events.push({
          id: `enc-${snap.version || 1}-${idx}`,
          type: 'encounter',
          name: e.type || 'Encounter',
          timestamp: new Date(e.date || snap.timestamp || Date.now()),
          value: { diagnosis: e.diagnosis }
        });
      });

      // Extract medications
      profile.medications?.forEach((m: any) => {
        events.push({
          id: `med-${m.id || Math.random()}-${snap.version || 1}`,
          type: 'medication',
          name: m.name || 'Medication',
          timestamp: new Date(snap.timestamp || Date.now()),
          value: { active: !!m.active }
        });
      });
    });

    // Sort events strictly chronologically
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Deduplicate events with identical name, timestamp, and type
    const deduplicatedEvents = events.filter((v, i, a) => 
      a.findIndex(t => (t.name === v.name && t.timestamp.getTime() === v.timestamp.getTime() && t.type === v.type)) === i
    );

    const metadata: TimelineMetadata = {
      reconstructedAt: new Date(),
      snapshotCount: sortedSnapshots.length,
      timeRange: {
        start: deduplicatedEvents[0]?.timestamp || new Date(),
        end: deduplicatedEvents[deduplicatedEvents.length - 1]?.timestamp || new Date()
      }
    };

    return {
      patientId: twin?.patientId || twin?.patient_id || 'anonymous',
      metadata,
      events: deduplicatedEvents,
      snapshots: sortedSnapshots
    };
  }
}
