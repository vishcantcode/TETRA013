// ============================================================================
// HPPHI – Capability 4: Lifestyle Optimization Module
// ============================================================================

import { HPPHIPatientInput, HPPHILifestyleRecommendation, LifestyleDomain } from './types';

interface LifestyleRule {
  domain: LifestyleDomain;
  check: (patient: HPPHIPatientInput) => boolean;
  recommendation: string;
  rationale: string;
  expectedBenefit: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceReference: string;
}

const LIFESTYLE_RULES: LifestyleRule[] = [
  // ── NUTRITION ──
  {
    domain: 'NUTRITION',
    check: p => p.lifestyleFactors.dietQuality === 'POOR' || p.lifestyleFactors.dietQuality === 'FAIR',
    recommendation: 'Adopt DASH or Mediterranean diet: increase fruits, vegetables, whole grains, lean proteins. Limit sodium to <2300mg/day.',
    rationale: 'Suboptimal diet quality is the leading modifiable risk factor for cardiometabolic disease.',
    expectedBenefit: 'DASH diet reduces systolic BP by 8-14 mmHg. Mediterranean diet reduces CVD events by 30%.',
    priority: 'HIGH',
    evidenceReference: 'DASH Trial / PREDIMED Study (NEJM 2013)'
  },
  {
    domain: 'NUTRITION',
    check: p => p.chronicConditions.some(c => c.toLowerCase().includes('diabetes')) && (p.lifestyleFactors.dietQuality !== 'EXCELLENT'),
    recommendation: 'Medical nutrition therapy with carbohydrate counting. Emphasize low-glycemic-index foods and fiber intake ≥25g/day.',
    rationale: 'Diabetic patients benefit from structured dietary counseling to improve glycemic control.',
    expectedBenefit: 'Structured MNT reduces HbA1c by 0.3-1.0% within 3-6 months.',
    priority: 'HIGH',
    evidenceReference: 'ADA 2024 Standards of Medical Care – Nutrition Therapy'
  },
  // ── PHYSICAL ACTIVITY ──
  {
    domain: 'PHYSICAL_ACTIVITY',
    check: p => p.lifestyleFactors.physicalActivityMinPerWeek < 150,
    recommendation: 'Increase aerobic activity to ≥150 minutes/week of moderate-intensity exercise (brisk walking, cycling, swimming).',
    rationale: 'Current activity level is below WHO and AHA minimum recommendations.',
    expectedBenefit: 'Reduces all-cause mortality by 30%, CVD events by 35%, and diabetes risk by 58%.',
    priority: 'HIGH',
    evidenceReference: 'WHO 2020 Physical Activity Guidelines / DPP Trial'
  },
  {
    domain: 'PHYSICAL_ACTIVITY',
    check: p => p.lifestyleFactors.physicalActivityMinPerWeek >= 150 && p.lifestyleFactors.physicalActivityMinPerWeek < 300,
    recommendation: 'Consider increasing activity to ≥300 minutes/week for additional cardiovascular benefit. Add resistance training 2x/week.',
    rationale: 'Additional health benefits accrue with activity above the minimum threshold.',
    expectedBenefit: 'Further 10-15% reduction in CVD risk and improved metabolic health.',
    priority: 'MEDIUM',
    evidenceReference: 'WHO 2020 Physical Activity Guidelines'
  },
  // ── SLEEP ──
  {
    domain: 'SLEEP',
    check: p => p.lifestyleFactors.sleepHoursPerNight < 7,
    recommendation: 'Target 7-9 hours of sleep per night. Establish consistent sleep-wake schedule, limit screen time before bed, keep bedroom cool and dark.',
    rationale: 'Short sleep duration (<7 hours) is associated with increased cardiovascular, metabolic, and mental health risk.',
    expectedBenefit: 'Adequate sleep reduces hypertension risk by 17%, diabetes risk by 12%, and improves cognitive function.',
    priority: 'HIGH',
    evidenceReference: 'AHA Life\'s Essential 8 / AASM Sleep Duration Recommendations'
  },
  // ── STRESS MANAGEMENT ──
  {
    domain: 'STRESS_MANAGEMENT',
    check: p => p.lifestyleFactors.stressLevel === 'HIGH',
    recommendation: 'Implement structured stress reduction: mindfulness-based stress reduction (MBSR), cognitive behavioral therapy, or regular relaxation techniques.',
    rationale: 'Chronic high stress activates the HPA axis, increasing cortisol, blood pressure, and inflammation.',
    expectedBenefit: 'MBSR reduces perceived stress by 30%, systolic BP by 4-5 mmHg, and improves mental well-being.',
    priority: 'HIGH',
    evidenceReference: 'AHA 2021 Psychological Health Statement / MBSR Meta-Analysis (JAMA 2019)'
  },
  // ── SMOKING CESSATION ──
  {
    domain: 'SMOKING_CESSATION',
    check: p => p.lifestyleFactors.smokingStatus === 'CURRENT',
    recommendation: 'Quit smoking immediately. Consider combination pharmacotherapy (varenicline + NRT) with behavioral counseling.',
    rationale: 'Smoking is the single most preventable cause of premature death. CVD risk halves within 1 year of cessation.',
    expectedBenefit: 'CVD risk reduced by 50% in 1 year, lung cancer risk reduced by 50% in 10 years, life expectancy gains of 6-10 years.',
    priority: 'HIGH',
    evidenceReference: 'USPSTF 2021 Smoking Cessation / Surgeon General Report'
  },
  // ── ALCOHOL REDUCTION ──
  {
    domain: 'ALCOHOL_REDUCTION',
    check: p => p.lifestyleFactors.alcoholUsePerWeek > 14,
    recommendation: 'Reduce alcohol consumption to ≤7 standard drinks/week (women) or ≤14 standard drinks/week (men). Consider addiction counseling if needed.',
    rationale: 'Excessive alcohol consumption increases risk of liver disease, hypertension, cardiomyopathy, and cancer.',
    expectedBenefit: 'Reducing alcohol to moderate levels lowers systolic BP by 2-4 mmHg, reduces liver enzyme elevations, and decreases cancer risk.',
    priority: 'HIGH',
    evidenceReference: 'NIAAA Alcohol Guidelines / WHO AUDIT Screening'
  },
  {
    domain: 'ALCOHOL_REDUCTION',
    check: p => p.lifestyleFactors.alcoholUsePerWeek > 7 && p.lifestyleFactors.alcoholUsePerWeek <= 14,
    recommendation: 'Consider reducing alcohol consumption. Current intake is moderate but reducing further may provide health benefits.',
    rationale: 'Even moderate alcohol use confers some health risks including increased cancer and liver disease risk.',
    expectedBenefit: 'Lower alcohol intake associated with reduced all-cause mortality and cancer risk.',
    priority: 'MEDIUM',
    evidenceReference: 'WHO 2023 Statement on Alcohol / Lancet 2018 Global Burden Study'
  }
];

export class HPPHILifestyleEngine {

  public evaluate(patient: HPPHIPatientInput): HPPHILifestyleRecommendation[] {
    const recommendations: HPPHILifestyleRecommendation[] = [];

    for (const rule of LIFESTYLE_RULES) {
      if (rule.check(patient)) {
        recommendations.push({
          domain: rule.domain,
          recommendation: rule.recommendation,
          rationale: rule.rationale,
          expectedBenefit: rule.expectedBenefit,
          priority: rule.priority,
          evidenceReference: rule.evidenceReference
        });
      }
    }

    // Sort by priority: HIGH > MEDIUM > LOW
    const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    recommendations.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

    return recommendations;
  }
}
