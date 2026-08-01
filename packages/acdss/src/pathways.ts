// ============================================================================
// ACDSS – Capability 5: Clinical Pathway Generator
// ============================================================================

import { ACDSSPatientCase, ACDSSClinicalPathway, ACDSSPathwayStep } from './types';
import { hckep } from '@healthsense/hckep';

interface PathwayTemplate {
  conditionPattern: string;
  guidelineId: string;
  steps: Omit<ACDSSPathwayStep, 'order'>[];
}

const PATHWAY_TEMPLATES: PathwayTemplate[] = [
  {
    conditionPattern: 'hypertension',
    guidelineId: 'gdl-htn-01',
    steps: [
      { action: 'Comprehensive BP Assessment', category: 'ASSESSMENT', timeframe: 'Day 1', details: 'Confirm diagnosis with repeat measurements. Evaluate for secondary causes.' },
      { action: 'Lifestyle Modifications', category: 'LIFESTYLE', timeframe: 'Week 1-4', details: 'DASH diet, sodium restriction (<2300mg/day), regular aerobic exercise (150 min/week), weight management.' },
      { action: 'Pharmacotherapy Initiation', category: 'MEDICATION', timeframe: 'Week 4-8', details: 'First-line agents: ACE inhibitor, ARB, CCB, or thiazide diuretic. Select based on comorbidities.' },
      { action: 'BP Monitoring Protocol', category: 'MONITORING', timeframe: 'Ongoing', details: 'Home BP monitoring twice daily. Clinic visit every 4-6 weeks until target achieved.' },
      { action: 'Response Evaluation', category: 'FOLLOW_UP', timeframe: 'Month 3', details: 'Assess BP control. If at target, extend follow-up to every 3-6 months. If not, intensify therapy.' },
      { action: 'Specialist Referral', category: 'REFERRAL', timeframe: 'If resistant', details: 'Refer to hypertension specialist if BP uncontrolled on 3+ agents including diuretic.' },
      { action: 'Patient Education', category: 'EDUCATION', timeframe: 'Ongoing', details: 'Educate on medication adherence, lifestyle changes, and warning signs of hypertensive emergency.' }
    ]
  },
  {
    conditionPattern: 'diabetes',
    guidelineId: 'gdl-htn-01',
    steps: [
      { action: 'Metabolic Assessment', category: 'ASSESSMENT', timeframe: 'Day 1', details: 'HbA1c, fasting glucose, lipid panel, renal function, foot exam, ophthalmology referral.' },
      { action: 'Medical Nutrition Therapy', category: 'LIFESTYLE', timeframe: 'Week 1-4', details: 'Carbohydrate counting, Mediterranean or DASH diet adaptation, caloric management.' },
      { action: 'Glycemic Therapy', category: 'MEDICATION', timeframe: 'Week 1-8', details: 'Metformin first-line. Add SGLT2i or GLP-1 RA if cardiovascular or renal comorbidities present.' },
      { action: 'Glucose Monitoring', category: 'MONITORING', timeframe: 'Ongoing', details: 'Self-monitoring of blood glucose. Consider CGM if on insulin or with hypoglycemia risk.' },
      { action: 'Quarterly Review', category: 'FOLLOW_UP', timeframe: 'Every 3 months', details: 'HbA1c measurement. Evaluate for complications. Medication dose adjustment as needed.' },
      { action: 'Complication Screening', category: 'REFERRAL', timeframe: 'Annually', details: 'Annual eye exam, foot exam, microalbuminuria screening, cardiovascular risk assessment.' }
    ]
  },
  {
    conditionPattern: 'ckd',
    guidelineId: 'gdl-htn-01',
    steps: [
      { action: 'Renal Function Staging', category: 'ASSESSMENT', timeframe: 'Day 1', details: 'Confirm CKD staging with eGFR and urine albumin-to-creatinine ratio (UACR).' },
      { action: 'Dietary Modifications', category: 'LIFESTYLE', timeframe: 'Week 1-4', details: 'Protein restriction (0.8g/kg/day), potassium and phosphorus management, sodium restriction.' },
      { action: 'Nephroprotective Therapy', category: 'MEDICATION', timeframe: 'Week 1-4', details: 'ACE inhibitor or ARB for proteinuria. SGLT2i if appropriate. Avoid nephrotoxins.' },
      { action: 'Renal Monitoring', category: 'MONITORING', timeframe: 'Quarterly', details: 'eGFR, creatinine, potassium, phosphorus, calcium, PTH, hemoglobin monitoring.' },
      { action: 'Progression Assessment', category: 'FOLLOW_UP', timeframe: 'Every 3-6 months', details: 'Track eGFR decline rate. Evaluate for anemia of CKD. Assess volume status.' },
      { action: 'Nephrology Referral', category: 'REFERRAL', timeframe: 'eGFR <30', details: 'Refer to nephrology for RRT planning. Discuss dialysis access and transplant workup.' }
    ]
  },
  {
    conditionPattern: 'cardiovascular',
    guidelineId: 'gdl-prev-01',
    steps: [
      { action: 'Cardiovascular Risk Assessment', category: 'ASSESSMENT', timeframe: 'Day 1', details: 'ASCVD risk calculator, lipid panel, ECG, echocardiogram if indicated.' },
      { action: 'Lifestyle Optimization', category: 'LIFESTYLE', timeframe: 'Week 1-4', details: 'Smoking cessation, Mediterranean diet, aerobic exercise 150 min/week, stress management.' },
      { action: 'Cardiovascular Pharmacotherapy', category: 'MEDICATION', timeframe: 'Week 1-4', details: 'High-intensity statin, antiplatelet (if indicated), beta-blocker (if post-MI or HFrEF).' },
      { action: 'Cardiac Monitoring', category: 'MONITORING', timeframe: 'Ongoing', details: 'BP, heart rate, lipid panel every 6-12 months. Serial troponin if ACS suspected.' },
      { action: 'Cardiac Rehabilitation', category: 'FOLLOW_UP', timeframe: 'Post-event', details: 'Structured cardiac rehab program for 12 weeks. Exercise tolerance testing.' },
      { action: 'Cardiology Referral', category: 'REFERRAL', timeframe: 'As needed', details: 'Refer for advanced imaging, catheterization, or electrophysiology evaluation.' }
    ]
  }
];

export class ACDSSPathwayGenerator {

  public generate(patientCase: ACDSSPatientCase): ACDSSClinicalPathway[] {
    const pathways: ACDSSClinicalPathway[] = [];

    for (const condition of patientCase.chronicConditions) {
      const normalized = condition.toLowerCase();
      for (const template of PATHWAY_TEMPLATES) {
        if (normalized.includes(template.conditionPattern)) {
          const guidelineEntry = hckep.getRepository().getLatest(template.guidelineId);
          const guidelineRef = guidelineEntry
            ? `${guidelineEntry.title} (${guidelineEntry.evidenceSource})`
            : `guideline:${template.guidelineId}`;

          pathways.push({
            condition,
            steps: template.steps.map((s, i) => ({ ...s, order: i + 1 })),
            guidelineReference: guidelineRef
          });
          break; // Only one pathway per matching condition
        }
      }
    }

    return pathways;
  }
}
