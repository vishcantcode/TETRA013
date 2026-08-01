export type SpecialistType =
  | 'General Physician'
  | 'Endocrinologist'
  | 'Cardiologist'
  | 'Nephrologist'
  | 'Neurologist'
  | 'Ophthalmologist'
  | 'Dietitian'
  | 'Diabetes Educator';

export interface ReferralReason {
  targetSpecialty: SpecialistType;
  primaryDiagnosis: string;
  clinicalJustification: string;
  prerequisiteInvestigations: string[];
}
