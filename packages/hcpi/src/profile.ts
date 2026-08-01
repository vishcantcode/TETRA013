export interface HCPIPatientProfile {
  patientId: string;
  version: number;
  lastUpdated: Date;
  chronicConditions: string[];
  activeMedications: string[];
  allergies: string[];
  vitalTrajectories: { metric: string; value: number; trend: 'RISING' | 'STABLE' | 'FALLING' }[];
  adherenceScore: number;
  historicalCarePlanCount: number;
  interventionOutcomes: { intervention: string; outcome: 'SUCCESS' | 'PARTIAL' | 'UNRESOLVED' }[];
}

export class HCPIProfileManager {
  private profiles: Map<string, HCPIPatientProfile> = new Map();

  public getOrCreateProfile(patientId: string, initialData?: Partial<HCPIPatientProfile>): HCPIPatientProfile {
    let profile = this.profiles.get(patientId);
    if (!profile) {
      profile = {
        patientId,
        version: 1,
        lastUpdated: new Date(),
        chronicConditions: initialData?.chronicConditions || ['Hypertension'],
        activeMedications: initialData?.activeMedications || ['Lisinopril 10mg'],
        allergies: initialData?.allergies || ['Penicillin'],
        vitalTrajectories: initialData?.vitalTrajectories || [
          { metric: 'Systolic BP', value: 135, trend: 'STABLE' },
          { metric: 'Fasting Glucose', value: 105, trend: 'STABLE' }
        ],
        adherenceScore: initialData?.adherenceScore ?? 92,
        historicalCarePlanCount: initialData?.historicalCarePlanCount ?? 1,
        interventionOutcomes: initialData?.interventionOutcomes || [
          { intervention: 'Sodium Intake Reduction', outcome: 'SUCCESS' }
        ]
      };
      this.profiles.set(patientId, profile);
    }
    return profile;
  }

  public updateProfile(patientId: string, delta: Partial<HCPIPatientProfile>): HCPIPatientProfile {
    const current = this.getOrCreateProfile(patientId);
    const updated: HCPIPatientProfile = {
      ...current,
      ...delta,
      version: current.version + 1,
      lastUpdated: new Date()
    };
    this.profiles.set(patientId, updated);
    return updated;
  }
}
