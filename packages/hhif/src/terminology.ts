// ============================================================================
// HHIF – Capability 4: Terminology Extension Interfaces
// ============================================================================

import { FHIRCoding, FHIRCodeableConcept } from './types';

export interface TerminologyMapping {
  system: string;
  code: string;
  display: string;
}

export class HHIFTerminologyEngine {
  private loincMap: Map<string, TerminologyMapping> = new Map([
    ['Systolic BP', { system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }],
    ['Diastolic BP', { system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }],
    ['HbA1c', { system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c/Hemoglobin.total in Blood' }],
    ['Fasting Glucose', { system: 'http://loinc.org', code: '1558-6', display: 'Fasting glucose [Mass/volume] in Serum or Plasma' }],
    ['LDL', { system: 'http://loinc.org', code: '2093-3', display: 'Cholesterol in LDL [Mass/volume] in Serum or Plasma' }],
    ['eGFR', { system: 'http://loinc.org', code: '33914-3', display: 'Glomerular filtration rate/1.73 sq M.predicted' }],
    ['BMI', { system: 'http://loinc.org', code: '39156-5', display: 'Body mass index (BMI) [Ratio]' }],
  ]);

  private snomedMap: Map<string, TerminologyMapping> = new Map([
    ['Hypertension', { system: 'http://snomed.info/sct', code: '38341003', display: 'Hypertensive disorder' }],
    ['Essential Hypertension', { system: 'http://snomed.info/sct', code: '59621000', display: 'Essential hypertension' }],
    ['Type 2 Diabetes', { system: 'http://snomed.info/sct', code: '44054006', display: 'Type 2 diabetes mellitus' }],
    ['CKD Stage 3a', { system: 'http://snomed.info/sct', code: '709044004', display: 'Chronic kidney disease stage 3a' }],
    ['Obesity', { system: 'http://snomed.info/sct', code: '414916001', display: 'Obesity' }],
  ]);

  private rxNormMap: Map<string, TerminologyMapping> = new Map([
    ['Lisinopril 20mg', { system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '314076', display: 'Lisinopril 20 MG Oral Tablet' }],
    ['Metformin 1000mg', { system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '861004', display: 'Metformin hydrochloride 1000 MG Oral Tablet' }],
    ['Simvastatin 20mg', { system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '312961', display: 'Simvastatin 20 MG Oral Tablet' }],
    ['Amlodipine 5mg', { system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '197361', display: 'Amlodipine 5 MG Oral Tablet' }],
  ]);

  public lookupLOINC(metricOrTest: string): FHIRCodeableConcept {
    const found = this.loincMap.get(metricOrTest);
    if (found) {
      return {
        text: metricOrTest,
        coding: [{ system: found.system, code: found.code, display: found.display }],
      };
    }
    return { text: metricOrTest, coding: [{ system: 'http://loinc.org', code: 'UNKNOWN', display: metricOrTest }] };
  }

  public lookupSNOMED(conditionName: string): FHIRCodeableConcept {
    const found = this.snomedMap.get(conditionName);
    if (found) {
      return {
        text: conditionName,
        coding: [{ system: found.system, code: found.code, display: found.display }],
      };
    }
    return { text: conditionName, coding: [{ system: 'http://snomed.info/sct', code: 'UNKNOWN', display: conditionName }] };
  }

  public lookupRxNorm(medicationName: string): FHIRCodeableConcept {
    const found = this.rxNormMap.get(medicationName);
    if (found) {
      return {
        text: medicationName,
        coding: [{ system: found.system, code: found.code, display: found.display }],
      };
    }
    return { text: medicationName, coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: 'UNKNOWN', display: medicationName }] };
  }
}
