import { NormalizedObservation } from '../normalization';

export interface PatientProfile {
  id: string;
  age: number;
  gender: string;
  conditions: string[];
}

export interface ClinicalContext {
  patient: PatientProfile;
  observations: NormalizedObservation[];
  recentDecisions: any[];
  completenessScore: number;
  freshnessScore: number;
  hasContradictions: boolean;
}

export class ClinicalContextEngine {
  buildContext(patient: PatientProfile, observations: NormalizedObservation[], decisions: any[]): ClinicalContext {
    return {
      patient,
      observations,
      recentDecisions: decisions,
      completenessScore: this.calculateCompleteness(observations),
      freshnessScore: this.calculateFreshness(observations),
      hasContradictions: this.detectContradictions(observations)
    };
  }

  private calculateCompleteness(obs: NormalizedObservation[]) { return obs.length > 0 ? 0.9 : 0.4; }
  private calculateFreshness(obs: NormalizedObservation[]) { return 1.0; }
  private detectContradictions(obs: NormalizedObservation[]) { return false; }
}
