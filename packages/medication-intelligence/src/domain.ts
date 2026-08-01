export interface MedicationDose {
  amount: number;
  unit: string;
}

export interface MedicationSchedule {
  frequency: 'daily' | 'weekly' | 'as_needed' | 'custom';
  timesOfDay?: string[];
  daysOfWeek?: number[];
  intervalHours?: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dose: MedicationDose;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical';
  route: string;
}

export interface MedicationCourse {
  id: string;
  medication: Medication;
  schedule: MedicationSchedule;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'discontinued' | 'paused';
  prescribedForConditionId?: string;
}

export interface MedicationAdministration {
  id: string;
  courseId: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: 'taken' | 'missed' | 'skipped' | 'delayed';
  notes?: string;
}

export interface MedicationAdherence {
  courseId: string;
  overallScore: number; // 0 to 100
  missedDoses30Days: number;
  consecutiveMissedDoses: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface MedicationAlert {
  id: string;
  type: 'interaction' | 'contraindication' | 'duplicate_therapy' | 'disease_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  involvedMedications: string[];
}

export interface MedicationPlan {
  patientId: string;
  activeCourses: MedicationCourse[];
  historicalCourses: MedicationCourse[];
  adherenceProfiles: Record<string, MedicationAdherence>;
  activeAlerts: MedicationAlert[];
}

export interface MedicationRecommendation {
  action: 'adjust_dose' | 'discontinue' | 'counseling_required' | 'monitor_side_effects';
  targetCourseId?: string;
  confidence: number;
  evidence: string[];
  explanation: {
    patient: string;
    clinician: string;
  };
}
