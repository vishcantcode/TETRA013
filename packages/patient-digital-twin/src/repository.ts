export * from './repository/index';

import { PatientTwin } from './domain';

export class TwinFactory {
  static createInitial(patientId: string): PatientTwin {
    return new PatientTwin(
      patientId,
      1,
      {
        symptoms: [],
        medications: [],
        vitals: [],
        risk: { factors: [], lastUpdated: new Date() },
        lifestyle: { diet: 'unknown', exercise: 'unknown', smoking: false, alcohol: false },
        behavior: { adherenceScore: 100 },
        carePlan: { currentPlanId: 'none', status: 'completed' },
        goals: { goals: [] }
      },
      { encounters: [], pastConditions: [] },
      []
    );
  }
}

export class LegacyTwinRepository {
  private db = new Map<string, any>();

  async findByPatientId(patientId: string): Promise<PatientTwin | null> {
    const raw = this.db.get(patientId);
    if (!raw) return null;
    return new PatientTwin(
      raw.patientId,
      raw._currentVersion || raw.currentVersion,
      raw._profile || raw.profile,
      raw._clinicalHistory || raw.clinicalHistory,
      raw._snapshots || raw.snapshots
    );
  }

  async save(twin: PatientTwin): Promise<void> {
    this.db.set(twin.patientId, {
      patientId: twin.patientId,
      currentVersion: twin.currentVersion,
      profile: twin.profile,
      clinicalHistory: twin.clinicalHistory,
      snapshots: twin.snapshots
    });
  }
}
