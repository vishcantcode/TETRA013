// ============================================================================
// HPPHI – Capability 1: Personalized Preventive Screening Engine
// ============================================================================

import { HPPHIPatientInput, HPPHIScreeningRecommendation, ScreeningPriority } from './types';

interface ScreeningRule {
  screening: string;
  applicableSex: 'M' | 'F' | 'ALL';
  minAge: number;
  maxAge: number;
  frequency: string;
  conditionTriggers: string[];           // extra triggers from chronic conditions / family history
  rationale: string;
  guidelineSource: string;
}

const SCREENING_RULES: ScreeningRule[] = [
  {
    screening: 'Blood Pressure Measurement',
    applicableSex: 'ALL', minAge: 18, maxAge: 120,
    frequency: 'Annually (every 6 months if elevated)',
    conditionTriggers: ['hypertension', 'cardiovascular', 'diabetes', 'ckd'],
    rationale: 'USPSTF Grade A: screening for hypertension in adults ≥18 years.',
    guidelineSource: 'USPSTF 2021 Hypertension Screening'
  },
  {
    screening: 'HbA1c / Fasting Glucose (Diabetes Screening)',
    applicableSex: 'ALL', minAge: 35, maxAge: 120,
    frequency: 'Every 3 years (annually if pre-diabetic or obese)',
    conditionTriggers: ['diabetes', 'obesity', 'metabolic syndrome', 'pcos'],
    rationale: 'USPSTF Grade B: screening for pre-diabetes and type 2 diabetes in adults aged 35-70 with overweight/obesity.',
    guidelineSource: 'USPSTF 2021 Pre-diabetes/Diabetes Screening'
  },
  {
    screening: 'Lipid Panel (Cholesterol Screening)',
    applicableSex: 'ALL', minAge: 40, maxAge: 75,
    frequency: 'Every 5 years (annually if on statin or high risk)',
    conditionTriggers: ['cardiovascular', 'diabetes', 'hyperlipidemia', 'family history of heart disease'],
    rationale: 'USPSTF Grade B: statin use for primary prevention of CVD in adults 40-75 with ≥1 CVD risk factor and 10-year ASCVD risk ≥10%.',
    guidelineSource: 'USPSTF 2022 Cardiovascular Risk / ACC/AHA Lipid Guidelines'
  },
  {
    screening: 'Kidney Function Panel (eGFR + UACR)',
    applicableSex: 'ALL', minAge: 45, maxAge: 120,
    frequency: 'Annually',
    conditionTriggers: ['ckd', 'diabetes', 'hypertension'],
    rationale: 'ADA/KDIGO: annual kidney function screening for patients with diabetes or hypertension.',
    guidelineSource: 'ADA 2024 Standards / KDIGO 2024 CKD Guidelines'
  },
  {
    screening: 'Liver Function Panel (ALT/AST)',
    applicableSex: 'ALL', minAge: 35, maxAge: 120,
    frequency: 'Every 2-3 years (annually if risk factors present)',
    conditionTriggers: ['obesity', 'diabetes', 'alcohol use disorder', 'hepatitis'],
    rationale: 'AASLD recommends screening for NAFLD/MASLD in patients with metabolic risk factors.',
    guidelineSource: 'AASLD 2023 MASLD Practice Guidance'
  },
  {
    screening: 'Dilated Eye Examination',
    applicableSex: 'ALL', minAge: 40, maxAge: 120,
    frequency: 'Every 1-2 years (annually if diabetic)',
    conditionTriggers: ['diabetes', 'hypertension', 'glaucoma'],
    rationale: 'ADA: annual dilated retinal exam for diabetic patients to detect retinopathy. AAO: comprehensive eye exam every 1-2 years for adults ≥40.',
    guidelineSource: 'ADA 2024 Standards / AAO Preferred Practice Pattern'
  },
  {
    screening: 'Dental Examination',
    applicableSex: 'ALL', minAge: 18, maxAge: 120,
    frequency: 'Every 6 months',
    conditionTriggers: ['diabetes', 'cardiovascular'],
    rationale: 'ADA (Dental): biannual dental exams for all adults. Periodontal disease is linked to CVD and glycemic control.',
    guidelineSource: 'ADA Dental Association Guidelines'
  },
  {
    screening: 'PHQ-9 Mental Health Screening',
    applicableSex: 'ALL', minAge: 18, maxAge: 120,
    frequency: 'Annually (more frequently if history present)',
    conditionTriggers: ['depression', 'anxiety', 'chronic pain', 'substance use'],
    rationale: 'USPSTF Grade B: screening for depression in the general adult population.',
    guidelineSource: 'USPSTF 2023 Depression Screening'
  },
  {
    screening: 'Colorectal Cancer Screening',
    applicableSex: 'ALL', minAge: 45, maxAge: 75,
    frequency: 'Colonoscopy every 10 years or FIT annually',
    conditionTriggers: ['family history of colorectal cancer', 'inflammatory bowel disease'],
    rationale: 'USPSTF Grade A: screening for colorectal cancer in adults aged 45-75.',
    guidelineSource: 'USPSTF 2021 Colorectal Cancer Screening'
  },
  {
    screening: 'Mammography (Breast Cancer Screening)',
    applicableSex: 'F', minAge: 40, maxAge: 74,
    frequency: 'Every 2 years (annually if high risk)',
    conditionTriggers: ['family history of breast cancer', 'brca mutation'],
    rationale: 'USPSTF Grade B: biennial mammography for women aged 40-74.',
    guidelineSource: 'USPSTF 2024 Breast Cancer Screening'
  },
  {
    screening: 'Prostate Cancer Screening (PSA)',
    applicableSex: 'M', minAge: 55, maxAge: 69,
    frequency: 'Every 2-4 years (shared decision-making)',
    conditionTriggers: ['family history of prostate cancer'],
    rationale: 'USPSTF Grade C: individualized decision for PSA screening in men 55-69.',
    guidelineSource: 'USPSTF 2018 Prostate Cancer Screening'
  },
  {
    screening: 'Bone Density (DEXA Scan)',
    applicableSex: 'F', minAge: 65, maxAge: 120,
    frequency: 'Every 2 years',
    conditionTriggers: ['osteoporosis', 'steroid use', 'early menopause'],
    rationale: 'USPSTF Grade B: screening for osteoporosis with DEXA in women ≥65.',
    guidelineSource: 'USPSTF 2018 Osteoporosis Screening'
  }
];

export class HPPHIScreeningEngine {

  public evaluate(patient: HPPHIPatientInput): HPPHIScreeningRecommendation[] {
    const recommendations: HPPHIScreeningRecommendation[] = [];
    const allTriggers = [
      ...patient.chronicConditions.map(c => c.toLowerCase()),
      ...patient.familyHistory.map(f => f.toLowerCase())
    ];

    for (const rule of SCREENING_RULES) {
      // Sex filter
      if (rule.applicableSex !== 'ALL' && rule.applicableSex !== patient.sex) continue;

      // Age filter
      if (patient.age < rule.minAge || patient.age > rule.maxAge) continue;

      const applicableCriteria: string[] = [];
      applicableCriteria.push(`Age ${patient.age} within ${rule.minAge}-${rule.maxAge} range`);

      // Check condition triggers for priority escalation
      const hasConditionTrigger = rule.conditionTriggers.some(t =>
        allTriggers.some(at => at.includes(t))
      );
      if (hasConditionTrigger) {
        const matched = rule.conditionTriggers.filter(t =>
          allTriggers.some(at => at.includes(t))
        );
        applicableCriteria.push(`Condition/history trigger: ${matched.join(', ')}`);
      }

      // Determine priority based on previous screening data
      let priority: ScreeningPriority = 'ROUTINE';
      const prevScreening = patient.previousScreenings.find(ps =>
        ps.screening.toLowerCase().includes(rule.screening.toLowerCase().split(' ')[0])
      );

      if (prevScreening) {
        const daysSinceLast = Math.floor((Date.now() - prevScreening.lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLast > 730) {
          priority = 'OVERDUE';
          applicableCriteria.push(`Last screening: ${daysSinceLast} days ago (overdue)`);
        } else {
          applicableCriteria.push(`Last screening: ${daysSinceLast} days ago`);
        }
      } else {
        priority = hasConditionTrigger ? 'RECOMMENDED' : 'ROUTINE';
        applicableCriteria.push('No previous screening on record');
      }

      if (hasConditionTrigger && priority === 'ROUTINE') {
        priority = 'RECOMMENDED';
      }

      const nextDueEstimate = prevScreening
        ? `Based on last screening and frequency: ${rule.frequency}`
        : 'Schedule as soon as possible — no prior record';

      recommendations.push({
        screening: rule.screening,
        priority,
        rationale: `${rule.rationale} Source: ${rule.guidelineSource}.`,
        suggestedFrequency: rule.frequency,
        nextDueEstimate,
        applicableCriteria
      });
    }

    // Sort by priority: URGENT > OVERDUE > RECOMMENDED > ROUTINE
    const priorityOrder: Record<ScreeningPriority, number> = { URGENT: 0, OVERDUE: 1, RECOMMENDED: 2, ROUTINE: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  }
}
