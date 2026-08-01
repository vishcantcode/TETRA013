// ============================================================================
// ACDSS – Capability 2: Multi-Condition Reasoning Engine
// ============================================================================

import { ACDSSPatientCase, ACDSSMultiConditionAssessment, ACDSSConditionInteraction } from './types';

interface ComorbidityRule {
  conditions: string[];
  interactionType: ACDSSConditionInteraction['interactionType'];
  description: string;
  clinicalImplication: string;
  riskModifier: number;
  holisticRecommendations: string[];
}

const COMORBIDITY_RULES: ComorbidityRule[] = [
  {
    conditions: ['diabetes', 'hypertension'],
    interactionType: 'SYNERGISTIC_RISK',
    description: 'Diabetes and hypertension synergistically increase cardiovascular and renal risk.',
    clinicalImplication: 'Target BP <130/80 mmHg per ADA/AHA joint guidelines. Prefer ACE inhibitors or ARBs for renal protection.',
    riskModifier: 1.8,
    holisticRecommendations: [
      'Initiate ACE inhibitor or ARB therapy for dual cardio-renal protection.',
      'Target HbA1c <7% with individualized glycemic control.',
      'Annual microalbuminuria screening for early nephropathy detection.',
      'Integrated dietary counseling: DASH diet with diabetic carbohydrate management.'
    ]
  },
  {
    conditions: ['ckd', 'hypertension'],
    interactionType: 'SYNERGISTIC_RISK',
    description: 'Chronic Kidney Disease accelerates hypertensive end-organ damage and vice versa.',
    clinicalImplication: 'Aggressive BP control (<130/80) with ACE/ARB. Avoid NSAIDs. Monitor potassium and creatinine closely.',
    riskModifier: 2.1,
    holisticRecommendations: [
      'ACE inhibitor or ARB preferred for proteinuria reduction.',
      'Avoid nephrotoxic agents (NSAIDs, aminoglycosides, contrast dye).',
      'Monitor eGFR and potassium every 3 months.',
      'Refer to nephrology if eGFR <30 mL/min/1.73m².'
    ]
  },
  {
    conditions: ['obesity', 'sleep apnea'],
    interactionType: 'SHARED_PATHWAY',
    description: 'Obesity is the primary modifiable risk factor for obstructive sleep apnea.',
    clinicalImplication: 'Weight loss of 10-15% can significantly reduce apnea severity. Evaluate for metabolic syndrome.',
    riskModifier: 1.5,
    holisticRecommendations: [
      'Structured weight loss program targeting 10-15% body weight reduction.',
      'Sleep study for CPAP evaluation if BMI >35 with symptoms.',
      'Screen for metabolic syndrome components.',
      'Consider bariatric surgery consultation if BMI >40 with comorbidities.'
    ]
  },
  {
    conditions: ['cardiovascular disease', 'diabetes'],
    interactionType: 'COMPOUNDING',
    description: 'Diabetes is a coronary artery disease equivalent, compounding cardiovascular morbidity and mortality.',
    clinicalImplication: 'Prescribe statin therapy regardless of LDL. Consider SGLT2 inhibitor or GLP-1 RA with cardiovascular benefit.',
    riskModifier: 2.3,
    holisticRecommendations: [
      'High-intensity statin therapy (atorvastatin 40-80mg or rosuvastatin 20-40mg).',
      'SGLT2 inhibitor (empagliflozin, dapagliflozin) for cardiorenal benefit.',
      'Antiplatelet therapy with aspirin (75-100mg) if not contraindicated.',
      'Cardiac rehabilitation and structured exercise program.'
    ]
  },
  {
    conditions: ['diabetes', 'ckd'],
    interactionType: 'COMPOUNDING',
    description: 'Diabetic nephropathy is the leading cause of end-stage renal disease.',
    clinicalImplication: 'Tight glycemic control (HbA1c <7%) delays progression. SGLT2 inhibitors reduce renal decline.',
    riskModifier: 2.0,
    holisticRecommendations: [
      'SGLT2 inhibitor for proven renal protection in diabetic nephropathy.',
      'ACE inhibitor or ARB to reduce proteinuria.',
      'Avoid metformin if eGFR <30 mL/min/1.73m².',
      'Quarterly monitoring of HbA1c, eGFR, and urine albumin-to-creatinine ratio.'
    ]
  }
];

export class ACDSSMultiConditionEngine {

  public evaluate(patientCase: ACDSSPatientCase): ACDSSMultiConditionAssessment {
    const detectedInteractions: ACDSSConditionInteraction[] = [];
    const allRecommendations: Set<string> = new Set();
    let combinedRiskScore = 1.0;

    const normalizedConditions = patientCase.chronicConditions.map(c => c.toLowerCase());

    for (const rule of COMORBIDITY_RULES) {
      const allPresent = rule.conditions.every(rc =>
        normalizedConditions.some(pc => pc.includes(rc))
      );

      if (allPresent) {
        detectedInteractions.push({
          conditions: rule.conditions,
          interactionType: rule.interactionType,
          description: rule.description,
          clinicalImplication: rule.clinicalImplication,
          adjustedRiskModifier: rule.riskModifier
        });

        for (const rec of rule.holisticRecommendations) {
          allRecommendations.add(rec);
        }

        combinedRiskScore *= rule.riskModifier;
      }
    }

    return {
      detectedInteractions,
      holisticRecommendations: Array.from(allRecommendations),
      combinedRiskScore: parseFloat(combinedRiskScore.toFixed(2))
    };
  }
}
