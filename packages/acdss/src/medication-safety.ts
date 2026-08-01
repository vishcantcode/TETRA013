// ============================================================================
// ACDSS – Capability 3: Medication Safety Engine
// ============================================================================

import { ACDSSPatientCase, ACDSSMedicationAlert, ACDSSMedicationSafetyResult, MedicationAlertSeverity } from './types';

interface DrugInteractionRule {
  drug1Pattern: string;
  drug2Pattern: string;
  type: ACDSSMedicationAlert['type'];
  severity: MedicationAlertSeverity;
  description: string;
  recommendation: string;
}

interface DrugAllergyRule {
  drugPattern: string;
  allergyPattern: string;
  severity: MedicationAlertSeverity;
  description: string;
  recommendation: string;
}

interface DrugDiseaseRule {
  drugPattern: string;
  conditionPattern: string;
  severity: MedicationAlertSeverity;
  description: string;
  recommendation: string;
}

const DRUG_INTERACTION_RULES: DrugInteractionRule[] = [
  {
    drug1Pattern: 'lisinopril',
    drug2Pattern: 'spironolactone',
    type: 'DRUG_DRUG',
    severity: 'HIGH',
    description: 'ACE inhibitor + potassium-sparing diuretic increases hyperkalemia risk.',
    recommendation: 'Monitor serum potassium within 1 week of co-initiation and regularly thereafter.'
  },
  {
    drug1Pattern: 'warfarin',
    drug2Pattern: 'aspirin',
    type: 'DRUG_DRUG',
    severity: 'HIGH',
    description: 'Concurrent anticoagulant and antiplatelet therapy significantly increases bleeding risk.',
    recommendation: 'Evaluate if dual therapy is clinically indicated. Consider PPI for GI protection.'
  },
  {
    drug1Pattern: 'metformin',
    drug2Pattern: 'contrast',
    type: 'DRUG_DRUG',
    severity: 'CRITICAL',
    description: 'Metformin with iodinated contrast agents may cause lactic acidosis in renal impairment.',
    recommendation: 'Hold metformin 48 hours before and after contrast administration. Check eGFR.'
  },
  {
    drug1Pattern: 'lisinopril',
    drug2Pattern: 'losartan',
    type: 'DUPLICATE_THERAPY',
    severity: 'HIGH',
    description: 'ACE inhibitor + ARB dual RAAS blockade increases renal impairment and hyperkalemia risk.',
    recommendation: 'Discontinue one agent. Dual RAAS blockade is not recommended by current guidelines.'
  },
  {
    drug1Pattern: 'simvastatin',
    drug2Pattern: 'amlodipine',
    type: 'DRUG_DRUG',
    severity: 'MODERATE',
    description: 'Amlodipine increases simvastatin exposure, raising myopathy risk.',
    recommendation: 'Limit simvastatin to 20mg daily when combined with amlodipine, or switch to atorvastatin.'
  },
  {
    drug1Pattern: 'metoprolol',
    drug2Pattern: 'verapamil',
    type: 'DRUG_DRUG',
    severity: 'CRITICAL',
    description: 'Beta-blocker + non-dihydropyridine CCB can cause severe bradycardia, heart block, or cardiac arrest.',
    recommendation: 'Avoid combination. If necessary, use only under specialist supervision with continuous monitoring.'
  }
];

const DRUG_ALLERGY_RULES: DrugAllergyRule[] = [
  {
    drugPattern: 'amoxicillin',
    allergyPattern: 'penicillin',
    severity: 'CRITICAL',
    description: 'Amoxicillin is a penicillin-class antibiotic. Documented penicillin allergy present.',
    recommendation: 'Avoid all penicillin-class antibiotics. Use azithromycin or fluoroquinolone alternative.'
  },
  {
    drugPattern: 'cephalexin',
    allergyPattern: 'penicillin',
    severity: 'HIGH',
    description: 'First-generation cephalosporin with ~1-2% cross-reactivity in penicillin-allergic patients.',
    recommendation: 'Consider allergy testing or use non-beta-lactam alternative.'
  },
  {
    drugPattern: 'sulfa',
    allergyPattern: 'sulfonamide',
    severity: 'CRITICAL',
    description: 'Sulfonamide-containing medication with documented sulfonamide allergy.',
    recommendation: 'Avoid all sulfonamide drugs. Select alternative antibiotic class.'
  }
];

const DRUG_DISEASE_RULES: DrugDiseaseRule[] = [
  {
    drugPattern: 'metformin',
    conditionPattern: 'ckd',
    severity: 'HIGH',
    description: 'Metformin is contraindicated in severe CKD (eGFR <30) due to lactic acidosis risk.',
    recommendation: 'Discontinue if eGFR <30. Reduce dose if eGFR 30-45. Monitor renal function quarterly.'
  },
  {
    drugPattern: 'nsaid',
    conditionPattern: 'ckd',
    severity: 'HIGH',
    description: 'NSAIDs can cause acute kidney injury and worsen chronic kidney disease.',
    recommendation: 'Avoid NSAIDs in CKD patients. Use acetaminophen for pain management.'
  },
  {
    drugPattern: 'metoprolol',
    conditionPattern: 'asthma',
    severity: 'HIGH',
    description: 'Beta-blockers may exacerbate bronchospasm in asthma patients.',
    recommendation: 'Prefer cardioselective agents or alternative antihypertensives. Monitor respiratory status.'
  }
];

export class ACDSSMedicationSafetyEngine {

  public evaluate(patientCase: ACDSSPatientCase): ACDSSMedicationSafetyResult {
    const alerts: ACDSSMedicationAlert[] = [];
    const normalizedMeds = patientCase.medications.map(m => m.toLowerCase());
    const normalizedAllergies = patientCase.allergies.map(a => a.toLowerCase());
    const normalizedConditions = patientCase.chronicConditions.map(c => c.toLowerCase());

    // 1. Drug-Drug Interactions
    for (const rule of DRUG_INTERACTION_RULES) {
      const hasDrug1 = normalizedMeds.some(m => m.includes(rule.drug1Pattern));
      const hasDrug2 = normalizedMeds.some(m => m.includes(rule.drug2Pattern));
      if (hasDrug1 && hasDrug2) {
        alerts.push({
          type: rule.type,
          severity: rule.severity,
          medications: [rule.drug1Pattern, rule.drug2Pattern],
          description: rule.description,
          recommendation: rule.recommendation
        });
      }
    }

    // 2. Drug-Allergy Interactions
    for (const rule of DRUG_ALLERGY_RULES) {
      const hasDrug = normalizedMeds.some(m => m.includes(rule.drugPattern));
      const hasAllergy = normalizedAllergies.some(a => a.includes(rule.allergyPattern));
      if (hasDrug && hasAllergy) {
        alerts.push({
          type: 'DRUG_ALLERGY',
          severity: rule.severity,
          medications: [rule.drugPattern],
          description: rule.description,
          recommendation: rule.recommendation
        });
      }
    }

    // 3. Drug-Disease Interactions
    for (const rule of DRUG_DISEASE_RULES) {
      const hasDrug = normalizedMeds.some(m => m.includes(rule.drugPattern));
      const hasCondition = normalizedConditions.some(c => c.includes(rule.conditionPattern));
      if (hasDrug && hasCondition) {
        alerts.push({
          type: 'DISEASE_INTERACTION',
          severity: rule.severity,
          medications: [rule.drugPattern],
          description: rule.description,
          recommendation: rule.recommendation
        });
      }
    }

    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = alerts.filter(a => a.severity === 'HIGH').length;
    const moderateCount = alerts.filter(a => a.severity === 'MODERATE').length;
    const lowCount = alerts.filter(a => a.severity === 'LOW').length;

    let overallSafetyStatus: ACDSSMedicationSafetyResult['overallSafetyStatus'] = 'SAFE';
    if (criticalCount > 0) overallSafetyStatus = 'CRITICAL_STOP';
    else if (highCount > 0) overallSafetyStatus = 'INTERVENTION_REQUIRED';
    else if (moderateCount > 0) overallSafetyStatus = 'REVIEW_RECOMMENDED';

    return {
      alerts,
      criticalCount,
      highCount,
      moderateCount,
      lowCount,
      overallSafetyStatus
    };
  }
}
