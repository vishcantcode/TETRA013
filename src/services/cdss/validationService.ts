import { Patient } from '../../types';
import { ValidationIssue, ValidationResult } from '../../types/cdss';

export class PatientDataValidationService {
  /**
   * Stage 1: Validates patient records against physiological ranges and completeness rules.
   * Does NOT halt execution; instead, flags issues and reduces overall quality score.
   */
  public static validatePatientData(patient: Patient, customVitals?: any): ValidationResult {
    const issues: ValidationIssue[] = [];
    const missingMandatoryFields: string[] = [];
    let qualityScore = 100;

    const vitals = customVitals || patient.vitals || {};

    // 1. Demographics checks
    if (!patient.name || patient.name.trim() === '') {
      missingMandatoryFields.push('Patient Name');
      issues.push({
        parameter: 'Patient Name',
        value: patient.name,
        severity: 'Error',
        message: 'Patient name is missing.',
        recommendation: 'Ensure patient profile is populated.',
      });
      qualityScore -= 10;
    }

    if (!patient.age || patient.age <= 0 || patient.age > 120) {
      issues.push({
        parameter: 'Age',
        value: patient.age,
        severity: patient.age < 0 ? 'Error' : 'Warning',
        message: `Age (${patient.age}) is outside valid physiological range (1 - 120 years).`,
        recommendation: 'Verify patient birth date in EHR system.',
      });
      qualityScore -= 15;
    }

    if (!patient.gender) {
      missingMandatoryFields.push('Gender');
      issues.push({
        parameter: 'Gender',
        value: patient.gender,
        severity: 'Caution',
        message: 'Gender is unspecified; using default risk coefficients.',
        recommendation: 'Select biological gender for precise ASCVD calculations.',
      });
      qualityScore -= 5;
    }

    // 2. Blood Pressure Validation
    const bpSystolic = vitals.bpSystolic;
    const bpDiastolic = vitals.bpDiastolic;

    if (bpSystolic === undefined || bpSystolic === null || bpSystolic === 0) {
      missingMandatoryFields.push('Systolic Blood Pressure');
      issues.push({
        parameter: 'Systolic Blood Pressure',
        value: bpSystolic,
        severity: 'Warning',
        message: 'Systolic blood pressure is missing.',
        recommendation: 'Record resting automated cuff blood pressure.',
      });
      qualityScore -= 15;
    } else if (bpSystolic < 60 || bpSystolic > 260) {
      issues.push({
        parameter: 'Systolic Blood Pressure',
        value: bpSystolic,
        severity: 'Warning',
        message: `Systolic BP (${bpSystolic} mmHg) is extreme; potential measurement error or acute crisis.`,
        recommendation: 'Repeat manual auscultatory blood pressure measurement.',
      });
      qualityScore -= 10;
    }

    if (bpDiastolic === undefined || bpDiastolic === null || bpDiastolic === 0) {
      missingMandatoryFields.push('Diastolic Blood Pressure');
      issues.push({
        parameter: 'Diastolic Blood Pressure',
        value: bpDiastolic,
        severity: 'Caution',
        message: 'Diastolic blood pressure is missing.',
        recommendation: 'Record diastolic pressure for pulse pressure assessment.',
      });
      qualityScore -= 5;
    } else if (bpDiastolic < 40 || bpDiastolic > 150) {
      issues.push({
        parameter: 'Diastolic Blood Pressure',
        value: bpDiastolic,
        severity: 'Warning',
        message: `Diastolic BP (${bpDiastolic} mmHg) is outside standard resting range.`,
        recommendation: 'Re-evaluate blood pressure technique and cuff size.',
      });
      qualityScore -= 10;
    }

    // 3. Glycemic Lab Validation
    const hba1c = vitals.hba1c;
    const glucose = vitals.glucose;

    if (hba1c === undefined || hba1c === null || hba1c <= 0) {
      missingMandatoryFields.push('HbA1c Assay');
      issues.push({
        parameter: 'HbA1c',
        value: hba1c,
        severity: 'Warning',
        message: 'HbA1c 90-day glycemic marker is missing.',
        recommendation: 'Order venous blood HbA1c lab test.',
      });
      qualityScore -= 20;
    } else if (hba1c < 3.0 || hba1c > 18.0) {
      issues.push({
        parameter: 'HbA1c',
        value: hba1c,
        severity: 'Warning',
        message: `HbA1c value (${hba1c}%) is physiologically unexpected.`,
        recommendation: 'Check lab assay calibration or hemoglobin variants.',
      });
      qualityScore -= 10;
    }

    if (glucose === undefined || glucose === null || glucose <= 0) {
      missingMandatoryFields.push('Glucose Level');
      issues.push({
        parameter: 'Fasting Blood Glucose',
        value: glucose,
        severity: 'Caution',
        message: 'Fasting glucose measurement is missing.',
        recommendation: 'Obtain point-of-care or fasting serum glucose.',
      });
      qualityScore -= 10;
    } else if (glucose < 30 || glucose > 600) {
      issues.push({
        parameter: 'Fasting Blood Glucose',
        value: glucose,
        severity: 'Warning',
        message: `Fasting Glucose (${glucose} mg/dL) indicates extreme hypo/hyperglycemia risk.`,
        recommendation: 'Verify immediate fingerstick or STAT serum chemistry.',
      });
      qualityScore -= 10;
    }

    // 4. Physical Anthropometrics
    const bmi = vitals.bmi;
    if (bmi === undefined || bmi === null || bmi <= 0) {
      missingMandatoryFields.push('BMI');
      issues.push({
        parameter: 'BMI',
        value: bmi,
        severity: 'Caution',
        message: 'Body Mass Index is missing.',
        recommendation: 'Measure height and weight to compute BMI.',
      });
      qualityScore -= 10;
    } else if (bmi < 12 || bmi > 70) {
      issues.push({
        parameter: 'BMI',
        value: bmi,
        severity: 'Caution',
        message: `BMI (${bmi} kg/m²) is outside typical distribution.`,
        recommendation: 'Confirm height and weight measurements.',
      });
      qualityScore -= 5;
    }

    // Negative values check across all numeric vitals
    Object.entries(vitals).forEach(([key, val]) => {
      if (typeof val === 'number' && val < 0) {
        issues.push({
          parameter: key,
          value: val,
          severity: 'Error',
          message: `${key} contains invalid negative number (${val}).`,
          recommendation: 'Correct input value.',
        });
        qualityScore -= 10;
      }
    });

    // Ensure score bounded between 10 and 100
    qualityScore = Math.max(10, Math.min(100, qualityScore));

    const completenessPercentage = Math.round(
      ((10 - missingMandatoryFields.length) / 10) * 100
    );

    return {
      isValid: issues.filter((i) => i.severity === 'Error').length === 0,
      qualityScore,
      issues,
      missingMandatoryFields,
      dataCompletenessText: `${completenessPercentage}% Complete (${issues.length} Validation Flags)`,
    };
  }
}
