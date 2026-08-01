// ============================================================================
// ACDSS – Capability 6: Referral Intelligence Module
// ============================================================================

import { ACDSSPatientCase, ACDSSReferralRecommendation, ReferralUrgency } from './types';

interface ReferralRule {
  specialty: string;
  triggers: { field: 'vitalSign' | 'lab' | 'condition' | 'symptom'; key: string; check: (v: any) => boolean }[];
  baseUrgency: ReferralUrgency;
  reasoning: string;
}

const REFERRAL_RULES: ReferralRule[] = [
  {
    specialty: 'Cardiology',
    triggers: [
      { field: 'vitalSign', key: 'Systolic BP', check: (v: number) => v >= 180 },
    ],
    baseUrgency: 'URGENT',
    reasoning: 'Hypertensive crisis (Systolic BP ≥180 mmHg) requires urgent cardiology evaluation for end-organ damage assessment.'
  },
  {
    specialty: 'Cardiology',
    triggers: [
      { field: 'symptom', key: 'chest pain', check: (symptoms: string[]) => symptoms.some(s => s.toLowerCase().includes('chest pain')) }
    ],
    baseUrgency: 'EMERGENT',
    reasoning: 'Chest pain requires emergent cardiac evaluation to rule out acute coronary syndrome.'
  },
  {
    specialty: 'Endocrinology',
    triggers: [
      { field: 'lab', key: 'HbA1c', check: (v: number) => v >= 9.0 }
    ],
    baseUrgency: 'URGENT',
    reasoning: 'HbA1c ≥9.0% indicates severe uncontrolled diabetes requiring specialist-guided therapy intensification.'
  },
  {
    specialty: 'Endocrinology',
    triggers: [
      { field: 'condition', key: 'diabetes', check: (conditions: string[]) => conditions.some(c => c.toLowerCase().includes('diabetes')) },
      { field: 'lab', key: 'HbA1c', check: (v: number) => v >= 8.0 }
    ],
    baseUrgency: 'SOON',
    reasoning: 'Suboptimal glycemic control (HbA1c ≥8.0%) in diagnosed diabetic warrants endocrinology consultation.'
  },
  {
    specialty: 'Nephrology',
    triggers: [
      { field: 'lab', key: 'eGFR', check: (v: number) => v < 30 }
    ],
    baseUrgency: 'URGENT',
    reasoning: 'eGFR <30 mL/min/1.73m² (Stage 4-5 CKD) requires nephrology referral for renal replacement therapy planning.'
  },
  {
    specialty: 'Nephrology',
    triggers: [
      { field: 'lab', key: 'eGFR', check: (v: number) => v < 45 }
    ],
    baseUrgency: 'SOON',
    reasoning: 'eGFR <45 mL/min/1.73m² warrants nephrology co-management for progressive CKD.'
  },
  {
    specialty: 'Pulmonology',
    triggers: [
      { field: 'symptom', key: 'dyspnea', check: (symptoms: string[]) => symptoms.some(s =>
        s.toLowerCase().includes('shortness of breath') || s.toLowerCase().includes('dyspnea')
      ) }
    ],
    baseUrgency: 'SOON',
    reasoning: 'Persistent dyspnea requires pulmonary evaluation including spirometry and possible imaging.'
  },
  {
    specialty: 'Neurology',
    triggers: [
      { field: 'symptom', key: 'neurological', check: (symptoms: string[]) => symptoms.some(s =>
        s.toLowerCase().includes('numbness') || s.toLowerCase().includes('weakness') || s.toLowerCase().includes('headache')
      ) }
    ],
    baseUrgency: 'SOON',
    reasoning: 'Neurological symptoms (numbness, weakness, persistent headache) warrant neurology consultation for differential evaluation.'
  }
];

export class ACDSSReferralEngine {

  public evaluate(patientCase: ACDSSPatientCase): ACDSSReferralRecommendation[] {
    const referrals: ACDSSReferralRecommendation[] = [];
    const addedSpecialties = new Set<string>();

    for (const rule of REFERRAL_RULES) {
      // Skip if already added a referral for this specialty at equal or higher urgency
      if (addedSpecialties.has(rule.specialty)) continue;

      const triggeringFindings: string[] = [];
      let allTriggered = true;

      for (const trigger of rule.triggers) {
        const matched = this.checkTrigger(patientCase, trigger);
        if (matched) {
          triggeringFindings.push(trigger.key);
        } else {
          allTriggered = false;
        }
      }

      if (allTriggered && triggeringFindings.length > 0) {
        referrals.push({
          specialty: rule.specialty,
          urgency: rule.baseUrgency,
          reasoning: rule.reasoning,
          triggeringFindings
        });
        addedSpecialties.add(rule.specialty);
      }
    }

    // Sort by urgency (EMERGENT > URGENT > SOON > ROUTINE)
    const urgencyOrder: Record<ReferralUrgency, number> = { EMERGENT: 0, URGENT: 1, SOON: 2, ROUTINE: 3 };
    referrals.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return referrals;
  }

  private checkTrigger(
    patientCase: ACDSSPatientCase,
    trigger: ReferralRule['triggers'][0]
  ): boolean {
    try {
      if (trigger.field === 'vitalSign') {
        const vital = patientCase.vitalSigns.find(v => v.metric === trigger.key);
        return vital ? trigger.check(vital.value) : false;
      }
      if (trigger.field === 'lab') {
        const lab = patientCase.laboratoryResults.find(l => l.test === trigger.key);
        return lab ? trigger.check(lab.value) : false;
      }
      if (trigger.field === 'condition') {
        return trigger.check(patientCase.chronicConditions);
      }
      if (trigger.field === 'symptom') {
        return trigger.check(patientCase.symptoms);
      }
      return false;
    } catch {
      return false;
    }
  }
}
