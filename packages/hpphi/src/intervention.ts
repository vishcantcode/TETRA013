// ============================================================================
// HPPHI – Capability 7: Intervention Impact Estimator
// ============================================================================

import { HPPHIPatientInput, HPPHIInterventionEstimate, HPPHIPreventiveHealthScore } from './types';

interface InterventionRule {
  intervention: string;
  applicable: (patient: HPPHIPatientInput) => boolean;
  scoreImprovement: (patient: HPPHIPatientInput) => number;
  riskReduction: string;
  assumptions: string[];
  uncertainty: string;
  timeToEffect: string;
}

const INTERVENTION_RULES: InterventionRule[] = [
  {
    intervention: 'Increase Physical Activity to ≥150 min/week',
    applicable: p => p.lifestyleFactors.physicalActivityMinPerWeek < 150,
    scoreImprovement: () => 8,
    riskReduction: 'CVD risk reduced 35%, diabetes risk reduced 58%, all-cause mortality reduced 30%.',
    assumptions: ['Patient sustains ≥150 min/week of moderate activity', 'No exercise contraindications'],
    uncertainty: 'Benefits may take 3-6 months to fully manifest. Individual response varies.',
    timeToEffect: '3-6 months'
  },
  {
    intervention: 'Improve Medication Adherence to ≥90%',
    applicable: p => true, // universally applicable
    scoreImprovement: (p) => p.chronicConditions.length > 0 ? 6 : 2,
    riskReduction: 'Hospitalization risk reduced 20-30%, disease-specific complications reduced.',
    assumptions: ['Adherence improves from current levels to ≥90%', 'Medications appropriately prescribed'],
    uncertainty: 'Depends on baseline adherence level and specific medications involved.',
    timeToEffect: '1-3 months'
  },
  {
    intervention: 'Achieve 5-10% Weight Reduction',
    applicable: p => (p.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 0) >= 25,
    scoreImprovement: () => 7,
    riskReduction: 'Systolic BP reduced 5-20 mmHg per 10kg lost, diabetes risk reduced 58% (DPP Trial), improved lipid profile.',
    assumptions: ['Weight loss of 5-10% achieved through diet and exercise', 'Weight maintained for ≥6 months'],
    uncertainty: 'Weight regain is common. Sustained behavioral support improves long-term outcomes.',
    timeToEffect: '6-12 months'
  },
  {
    intervention: 'Smoking Cessation',
    applicable: p => p.lifestyleFactors.smokingStatus === 'CURRENT',
    scoreImprovement: () => 15,
    riskReduction: 'CVD risk halved within 1 year, lung cancer risk halved within 10 years, 6-10 year life expectancy gain.',
    assumptions: ['Complete smoking cessation achieved and sustained', 'Pharmacotherapy plus behavioral support used'],
    uncertainty: 'Relapse rates are 60-80% without support. Combination therapy (varenicline + NRT) improves success.',
    timeToEffect: '1-12 months (progressive benefit)'
  },
  {
    intervention: 'Improve Sleep to 7-9 hours/night',
    applicable: p => p.lifestyleFactors.sleepHoursPerNight < 7,
    scoreImprovement: () => 4,
    riskReduction: 'Hypertension risk reduced 17%, improved glucose regulation, enhanced cognitive performance.',
    assumptions: ['Sleep duration increases to 7-9 hours/night', 'Sleep hygiene measures implemented'],
    uncertainty: 'Sleep disorders (e.g., sleep apnea) may require separate treatment. Improvement timeline varies.',
    timeToEffect: '2-4 weeks'
  },
  {
    intervention: 'Adopt DASH or Mediterranean Diet',
    applicable: p => p.lifestyleFactors.dietQuality === 'POOR' || p.lifestyleFactors.dietQuality === 'FAIR',
    scoreImprovement: () => 6,
    riskReduction: 'Systolic BP reduced 8-14 mmHg (DASH), CVD events reduced 30% (Mediterranean), improved lipid and glycemic profiles.',
    assumptions: ['Sustained dietary change for ≥3 months', 'Sodium intake <2300 mg/day achieved'],
    uncertainty: 'Dietary adherence is challenging long-term. Gradual implementation improves sustainability.',
    timeToEffect: '2-8 weeks (BP effects), 3-6 months (lipid/glycemic effects)'
  },
  {
    intervention: 'Stress Reduction Program (MBSR)',
    applicable: p => p.lifestyleFactors.stressLevel === 'HIGH',
    scoreImprovement: () => 5,
    riskReduction: 'Perceived stress reduced 30%, systolic BP reduced 4-5 mmHg, improved mental well-being and sleep quality.',
    assumptions: ['Patient engages in structured 8-week MBSR program', 'Regular mindfulness practice maintained'],
    uncertainty: 'Individual response to stress reduction varies. Some patients may need additional psychological support.',
    timeToEffect: '4-8 weeks'
  },
  {
    intervention: 'Reduce Alcohol to ≤7 drinks/week',
    applicable: p => p.lifestyleFactors.alcoholUsePerWeek > 14,
    scoreImprovement: () => 5,
    riskReduction: 'Systolic BP reduced 2-4 mmHg, liver enzyme normalization, reduced cancer and cardiovascular risk.',
    assumptions: ['Sustained alcohol reduction achieved', 'No underlying alcohol use disorder requiring intensive treatment'],
    uncertainty: 'Patients with alcohol dependence may need formal addiction treatment. Withdrawal risks must be managed.',
    timeToEffect: '2-4 weeks (BP/liver effects), months (cancer risk reduction)'
  }
];

export class HPPHIInterventionEngine {

  public estimate(patient: HPPHIPatientInput, healthScore: HPPHIPreventiveHealthScore): HPPHIInterventionEstimate[] {
    const estimates: HPPHIInterventionEstimate[] = [];

    for (const rule of INTERVENTION_RULES) {
      if (!rule.applicable(patient)) continue;

      estimates.push({
        intervention: rule.intervention,
        expectedScoreImprovement: rule.scoreImprovement(patient),
        expectedRiskReduction: rule.riskReduction,
        assumptions: rule.assumptions,
        uncertainty: rule.uncertainty,
        timeToEffect: rule.timeToEffect
      });
    }

    // Sort by expected score improvement descending
    estimates.sort((a, b) => b.expectedScoreImprovement - a.expectedScoreImprovement);
    return estimates;
  }
}
