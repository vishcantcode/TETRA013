import { HealthSnapshot } from '@healthsense/patient-digital-twin';

export interface TimelineMetadata {
  reconstructedAt: Date;
  snapshotCount: number;
  timeRange: { start: Date; end: Date };
}

export interface ClinicalEvent {
  id: string;
  type: 'symptom' | 'medication' | 'vital' | 'encounter' | 'risk_change' | 'intervention';
  name: string;
  timestamp: Date;
  value?: any;
  context?: string;
}

export interface PatientTimeline {
  patientId: string;
  metadata: TimelineMetadata;
  events: ClinicalEvent[];
  snapshots: HealthSnapshot[];
}

export interface ClinicalTrend {
  id: string;
  type: 'vital' | 'symptom' | 'adherence';
  metric: string;
  direction: 'improving' | 'worsening' | 'stable' | 'oscillating' | 'sudden_deviation';
  slope: number;
  confidence: number;
  durationMs: number;
  supportingEventIds: string[];
}

export interface Trajectory {
  id: string;
  type: 'clinical' | 'risk';
  state: 'improving' | 'deteriorating' | 'stable' | 'relapsing' | 'recovering';
  confidence: number;
  evidence: string[];
}

export interface InterventionEffect {
  interventionId: string;
  name: string;
  effect: 'positive' | 'negative' | 'neutral' | 'unknown';
  correlationConfidence: number;
}

export interface MedicationAdherenceProfile {
  medicationName: string;
  score: number; // 0-100
  trend: 'improving' | 'worsening' | 'stable';
}

export interface RiskEvolution {
  riskFactor: string;
  state: 'increasing' | 'decreasing' | 'stable' | 'emerging' | 'resolved';
}

export interface PredictionSignal {
  type: 'recurring_deterioration' | 'seasonal_pattern' | 'intervention_fatigue' | 'delayed_response';
  description: string;
  confidence: number;
}

export interface LongitudinalInsight {
  id: string;
  type: 'trend' | 'trajectory' | 'intervention' | 'adherence' | 'risk' | 'signal';
  payload: ClinicalTrend | Trajectory | InterventionEffect | MedicationAdherenceProfile | RiskEvolution | PredictionSignal;
  timestamp: Date;
}
