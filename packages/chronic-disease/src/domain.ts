export type DiseaseStage = 'pre' | 'early' | 'moderate' | 'advanced';
export type DiseaseSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface HealthTarget {
  id: string;
  metric: string;
  targetValue: number;
  unit: string;
  operator: '<' | '<=' | '>' | '>=';
  deadline?: Date;
}

export interface GoalProgress {
  targetId: string;
  currentValue: number;
  date: Date;
  status: 'on_track' | 'lagging' | 'achieved' | 'failed';
}

export interface MonitoringSchedule {
  frequencyDays: number;
  metrics: string[];
  nextReviewDate: Date;
}

export interface Intervention {
  id: string;
  type: 'lifestyle' | 'education' | 'clinical_review';
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface CarePlan {
  id: string;
  patientId: string;
  conditionId: string;
  targets: HealthTarget[];
  schedule: MonitoringSchedule;
  interventions: Intervention[];
  version: number;
  lastUpdated: Date;
}

export interface ConditionProfile {
  diagnosisDate: Date;
  stage: DiseaseStage;
  severity: DiseaseSeverity;
  tags: string[];
}

export interface ChronicCondition {
  id: string;
  patientId: string;
  name: string; // e.g. 'diabetes', 'hypertension'
  profile: ConditionProfile;
  carePlan: CarePlan;
  active: boolean;
}

export interface ConditionRecommendation {
  conditionId: string;
  recommendation: string;
  confidence: number;
  evidence: string[];
  explanation: {
    patient: string;
    clinician: string;
  };
}
