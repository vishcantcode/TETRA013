import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { LOINC_CODES } from '@healthsense/types';
import { ClinicalFeatureVector, PatientSnapshot } from '../interfaces/PatientSnapshot';

export class FeatureExtractor {
  public static extractFeatures(
    patient: FHIRPatient,
    vitals: FHIRObservation[] = [],
    labs: FHIRObservation[] = [],
    conditions: FHIRCondition[] = [],
    medications: FHIRMedicationRequest[] = [],
    _reports: FHIRDiagnosticReport[] = []
  ): ClinicalFeatureVector {
    // 1. Calculate Age from birthDate
    const birthYear = new Date(patient.birthDate).getFullYear();
    const age = Math.max(1, new Date().getFullYear() - birthYear);

    // 2. Extract Observations (Vitals & Labs) by LOINC code
    const findObservationValue = (code: string): number | null => {
      const allObs = [...vitals, ...labs];
      const match = allObs.find(o => o.code.coding.some(c => c.code === code));
      return match?.valueQuantity?.value ?? null;
    };

    const systolicBP = findObservationValue(LOINC_CODES.SYSTOLIC_BP);
    const diastolicBP = findObservationValue(LOINC_CODES.DIASTOLIC_BP);
    const bmi = findObservationValue(LOINC_CODES.BMI);
    const hba1c = findObservationValue(LOINC_CODES.HBA1C);
    const fastingGlucose = findObservationValue(LOINC_CODES.FASTING_GLUCOSE);
    const serumCreatinine = findObservationValue(LOINC_CODES.SERUM_CREATININE);
    const egfr = findObservationValue(LOINC_CODES.EGFR);
    const uacr = findObservationValue(LOINC_CODES.UACR);
    const totalCholesterol = findObservationValue(LOINC_CODES.TOTAL_CHOLESTEROL);
    const hdl = findObservationValue(LOINC_CODES.HDL_CHOLESTEROL);
    const ldl = findObservationValue(LOINC_CODES.LDL_CHOLESTEROL);
    const triglycerides = findObservationValue(LOINC_CODES.TRIGLYCERIDES);

    // 3. Extract Diagnoses
    const activeConditions = conditions
      .filter(c => c.clinicalStatus !== 'inactive')
      .map(c => c.code.text || c.code.coding[0]?.display || c.code.coding[0]?.code || 'Unknown Condition');

    // 4. Extract Medications
    const activeMedications = medications
      .filter(m => m.status === 'active')
      .map(m => m.medicationCodeableConcept.text || m.medicationCodeableConcept.coding[0]?.display || 'Unknown Drug');

    return {
      age,
      gender: patient.gender,
      smoking: activeConditions.some(c => c.toLowerCase().includes('smoke') || c.toLowerCase().includes('tobacco')),
      alcohol: activeConditions.some(c => c.toLowerCase().includes('alcohol')),
      familyHistoryDiabetes: activeConditions.some(c => c.toLowerCase().includes('family diabetes')),
      familyHistoryHypertension: activeConditions.some(c => c.toLowerCase().includes('family hypertension')),
      familyHistoryCVD: activeConditions.some(c => c.toLowerCase().includes('family cvd')),
      physicalActivityLevel: 'moderate',
      systolicBP,
      diastolicBP,
      bmi,
      pulse: null,
      waistCircumferenceCm: null,
      hba1c,
      fastingGlucose,
      randomGlucose: null,
      serumCreatinine,
      egfr,
      uacr,
      totalCholesterol,
      hdl,
      ldl,
      triglycerides,
      activeConditions,
      activeMedications
    };
  }

  public static createSnapshot(
    patient: FHIRPatient,
    vitals: FHIRObservation[] = [],
    labs: FHIRObservation[] = [],
    conditions: FHIRCondition[] = [],
    medications: FHIRMedicationRequest[] = [],
    reports: FHIRDiagnosticReport[] = []
  ): PatientSnapshot {
    const features = FeatureExtractor.extractFeatures(patient, vitals, labs, conditions, medications, reports);
    return {
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      features,
      rawResourcesCount: {
        observations: vitals.length + labs.length,
        conditions: conditions.length,
        medications: medications.length
      }
    };
  }
}
