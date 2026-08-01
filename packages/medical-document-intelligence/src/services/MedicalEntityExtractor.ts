import { ExtractedObservation } from '../interfaces/ExtractedObservation';
import { REGEX_PATTERNS } from '../utils/RegexLibrary';
import { LOINC_CODES } from '@healthsense/types';
import { interpretHbA1c, interpretBloodPressure, interpreteGFR, interpretUACR } from '@healthsense/utils';

export class MedicalEntityExtractor {
  public static extractObservations(text: string): ExtractedObservation[] {
    const observations: ExtractedObservation[] = [];

    // 1. HbA1c Extraction
    const hba1cMatch = text.match(REGEX_PATTERNS.HBA1C);
    if (hba1cMatch && hba1cMatch[1]) {
      const val = parseFloat(hba1cMatch[1]);
      const interp = interpretHbA1c(val);
      observations.push({
        id: `obs-hba1c-${Date.now()}`,
        loincCode: LOINC_CODES.HBA1C,
        testName: 'HbA1c (Glycated Hemoglobin)',
        value: val,
        unit: '%',
        referenceRangeText: interp.referenceRangeText,
        interpretationFlag: interp.flag,
        confidence: {
          metricName: 'HbA1c',
          ocrConfidence: 0.98,
          medicalConfidence: 0.98,
          validationConfidence: 0.99,
          overallConfidence: 0.98,
          needsClinicianReview: false
        }
      });
    }

    // 2. Fasting Glucose Extraction
    const fbsMatch = text.match(REGEX_PATTERNS.FASTING_GLUCOSE);
    if (fbsMatch && fbsMatch[1]) {
      const val = parseFloat(fbsMatch[1]);
      observations.push({
        id: `obs-fbs-${Date.now()}`,
        loincCode: LOINC_CODES.FASTING_GLUCOSE,
        testName: 'Fasting Plasma Glucose',
        value: val,
        unit: 'mg/dL',
        referenceRangeText: '70 - 100 mg/dL',
        interpretationFlag: val >= 126 ? 'high' : val >= 100 ? 'high' : 'normal',
        confidence: {
          metricName: 'Fasting Glucose',
          ocrConfidence: 0.96,
          medicalConfidence: 0.96,
          validationConfidence: 0.98,
          overallConfidence: 0.96,
          needsClinicianReview: false
        }
      });
    }

    // 3. eGFR Extraction
    const egfrMatch = text.match(REGEX_PATTERNS.EGFR);
    if (egfrMatch && egfrMatch[1]) {
      const val = parseFloat(egfrMatch[1]);
      const interp = interpreteGFR(val);
      observations.push({
        id: `obs-egfr-${Date.now()}`,
        loincCode: LOINC_CODES.EGFR,
        testName: 'eGFR (Estimated Glomerular Filtration Rate)',
        value: val,
        unit: 'mL/min/1.73m2',
        referenceRangeText: interp.referenceRangeText,
        interpretationFlag: interp.flag,
        confidence: {
          metricName: 'eGFR',
          ocrConfidence: 0.95,
          medicalConfidence: 0.95,
          validationConfidence: 0.97,
          overallConfidence: 0.95,
          needsClinicianReview: false
        }
      });
    }

    // 4. Blood Pressure Extraction
    const bpMatch = text.match(REGEX_PATTERNS.BLOOD_PRESSURE);
    if (bpMatch && bpMatch[1] && bpMatch[2]) {
      const sbp = parseFloat(bpMatch[1]);
      const dbp = parseFloat(bpMatch[2]);
      const interp = interpretBloodPressure(sbp, dbp);

      observations.push({
        id: `obs-sbp-${Date.now()}`,
        loincCode: LOINC_CODES.SYSTOLIC_BP,
        testName: 'Systolic Blood Pressure',
        value: sbp,
        unit: 'mmHg',
        referenceRangeText: interp.referenceRangeText,
        interpretationFlag: interp.flag,
        confidence: {
          metricName: 'Systolic BP',
          ocrConfidence: 0.97,
          medicalConfidence: 0.97,
          validationConfidence: 0.99,
          overallConfidence: 0.97,
          needsClinicianReview: false
        }
      });
    }

    return observations;
  }
}
