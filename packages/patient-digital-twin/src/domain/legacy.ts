export interface SymptomHistory {
  id: string;
  symptom: string;
  resolved: boolean;
  date: Date;
}

export interface MedicationHistory {
  id: string;
  name: string;
  active: boolean;
}

export interface VitalHistory {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: Date;
}

export interface RiskProfile {
  factors: string[];
  lastUpdated: Date;
}

export interface LifestyleProfile {
  diet: string;
  exercise: string;
  smoking: boolean;
  alcohol: boolean;
}

export interface BehaviorProfile {
  adherenceScore: number;
}

export interface CarePlanState {
  currentPlanId: string;
  status: 'active' | 'completed';
}

export interface HealthGoals {
  goals: string[];
}

export interface HealthProfile {
  symptoms: SymptomHistory[];
  medications: MedicationHistory[];
  vitals: VitalHistory[];
  risk: RiskProfile;
  lifestyle: LifestyleProfile;
  behavior: BehaviorProfile;
  carePlan: CarePlanState;
  goals: HealthGoals;
}

export interface ClinicalHistory {
  encounters: { date: Date; type: string; diagnosis?: string }[];
  pastConditions: string[];
}

export interface HealthSnapshot {
  version: number;
  timestamp: Date;
  profile: HealthProfile;
  clinicalHistory: ClinicalHistory;
}

export interface HealthDelta {
  addedSymptoms: SymptomHistory[];
  resolvedSymptoms: string[];
  newVitals: VitalHistory[];
  notes: string;
}

export class PatientTwin {
  public readonly patientId: string;
  private _currentVersion: number;
  private _profile: HealthProfile;
  private _clinicalHistory: ClinicalHistory;
  private _snapshots: HealthSnapshot[];

  constructor(
    patientId: string,
    currentVersion: number,
    profile: HealthProfile,
    clinicalHistory: ClinicalHistory,
    snapshots: HealthSnapshot[] = []
  ) {
    this.patientId = patientId;
    this._currentVersion = currentVersion;
    this._profile = profile;
    this._clinicalHistory = clinicalHistory;
    this._snapshots = snapshots;
  }

  get currentVersion() {
    return this._currentVersion;
  }

  get profile() {
    return JSON.parse(JSON.stringify(this._profile));
  }

  get clinicalHistory() {
    return JSON.parse(JSON.stringify(this._clinicalHistory));
  }

  get snapshots() {
    return JSON.parse(JSON.stringify(this._snapshots));
  }

  public addSymptom(symptom: SymptomHistory) {
    this._profile.symptoms.push(symptom);
    this.incrementVersion();
  }

  public recordEncounter(encounter: { date: Date; type: string; diagnosis?: string }) {
    this._clinicalHistory.encounters.push(encounter);
    this.incrementVersion();
  }

  public updateVitals(vital: VitalHistory) {
    this._profile.vitals.push(vital);
    this.incrementVersion();
  }

  private incrementVersion() {
    this._snapshots.push({
      version: this._currentVersion,
      timestamp: new Date(),
      profile: JSON.parse(JSON.stringify(this._profile)),
      clinicalHistory: JSON.parse(JSON.stringify(this._clinicalHistory))
    });
    this._currentVersion++;
  }
}
