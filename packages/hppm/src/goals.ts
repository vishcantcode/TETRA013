// ============================================================================
// HPPM – Capability 4: Personalized Goal Generator
// ============================================================================

import { HPPMCareProfile, HPPMPersonalizedGoal } from './types';

export class HPPMGoalEngine {

  public generate(profile: HPPMCareProfile): HPPMPersonalizedGoal[] {
    const goals: HPPMPersonalizedGoal[] = [];

    // ── Blood Pressure ──
    if (profile.chronicConditions.some(c => c.toLowerCase().includes('hypertension'))) {
      const sysBp = profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
      const hasDiabetes = profile.chronicConditions.some(c => c.toLowerCase().includes('diabetes'));
      const hasCkd = profile.chronicConditions.some(c => c.toLowerCase().includes('ckd'));
      const target = (hasDiabetes || hasCkd) ? '<130/80 mmHg' : '<140/90 mmHg';

      goals.push({
        domain: 'Blood Pressure',
        target,
        currentValue: sysBp ? `${sysBp} mmHg systolic` : 'Not measured',
        rationale: `${hasDiabetes ? 'Diabetic patients' : hasCkd ? 'CKD patients' : 'Hypertensive patients'} benefit from tighter BP control per AHA/ACC guidelines.`,
        timeframe: '3-6 months',
        priority: sysBp && sysBp >= 150 ? 'HIGH' : 'MEDIUM'
      });
    }

    // ── HbA1c ──
    if (profile.chronicConditions.some(c => c.toLowerCase().includes('diabetes'))) {
      const hba1c = profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value;
      const target = profile.demographics.age >= 75 ? '<8.0%' : '<7.0%';

      goals.push({
        domain: 'HbA1c (Glycemic Control)',
        target,
        currentValue: hba1c ? `${hba1c}%` : 'Not measured',
        rationale: profile.demographics.age >= 75
          ? 'Relaxed HbA1c target for older adults to minimize hypoglycemia risk (ADA).'
          : 'Standard HbA1c target for most adults with diabetes (ADA).',
        timeframe: '3-6 months',
        priority: hba1c && hba1c >= 9.0 ? 'HIGH' : 'MEDIUM'
      });
    }

    // ── Weight ──
    const bmi = profile.laboratoryResults.find(l => l.test === 'BMI')?.value;
    if (bmi && bmi >= 25) {
      const targetLoss = bmi >= 30 ? '5-10% body weight reduction' : '3-5% body weight reduction';
      goals.push({
        domain: 'Weight Management',
        target: targetLoss,
        currentValue: `BMI ${bmi} kg/m²`,
        rationale: 'Modest weight loss (5-10%) significantly improves BP, glycemic control, and lipid profiles.',
        timeframe: '6-12 months',
        priority: bmi >= 35 ? 'HIGH' : 'MEDIUM'
      });
    }

    // ── Physical Activity ──
    if (profile.lifestyleSnapshot.physicalActivityMinPerWeek < 150) {
      const exercisePref = profile.preferences.exercisePreference;
      goals.push({
        domain: 'Physical Activity',
        target: '≥150 min/week moderate-intensity',
        currentValue: `${profile.lifestyleSnapshot.physicalActivityMinPerWeek} min/week`,
        rationale: `Personalized target aligned with ${exercisePref} preference. WHO recommends ≥150 min/week for adults.`,
        timeframe: '2-3 months (gradual increase)',
        priority: profile.lifestyleSnapshot.physicalActivityMinPerWeek < 60 ? 'HIGH' : 'MEDIUM'
      });
    }

    // ── Cholesterol ──
    const ldl = profile.laboratoryResults.find(l => l.test === 'LDL')?.value;
    if (ldl && ldl >= 130) {
      const hasAscvd = profile.chronicConditions.some(c =>
        c.toLowerCase().includes('cardiovascular') || c.toLowerCase().includes('coronary')
      );
      const target = hasAscvd ? '<70 mg/dL' : '<100 mg/dL';
      goals.push({
        domain: 'LDL Cholesterol',
        target,
        currentValue: `${ldl} mg/dL`,
        rationale: hasAscvd
          ? 'Very high-risk ASCVD patients target LDL <70 mg/dL per ACC/AHA guidelines.'
          : 'Primary prevention target of LDL <100 mg/dL for patients with risk factors.',
        timeframe: '3-6 months',
        priority: ldl >= 190 ? 'HIGH' : 'MEDIUM'
      });
    }

    // ── Sleep ──
    if (profile.lifestyleSnapshot.sleepHoursPerNight < 7) {
      goals.push({
        domain: 'Sleep Duration',
        target: '7-9 hours/night',
        currentValue: `${profile.lifestyleSnapshot.sleepHoursPerNight} hours/night`,
        rationale: 'Adequate sleep (7-9h) reduces cardiovascular risk and improves metabolic health (AHA Life\'s Essential 8).',
        timeframe: '2-4 weeks',
        priority: profile.lifestyleSnapshot.sleepHoursPerNight < 5 ? 'HIGH' : 'LOW'
      });
    }

    // ── Smoking ──
    if (profile.lifestyleSnapshot.smokingStatus === 'CURRENT') {
      goals.push({
        domain: 'Tobacco Cessation',
        target: 'Complete cessation',
        currentValue: 'Active smoker',
        rationale: 'Smoking cessation is the single most impactful modifiable risk factor reduction.',
        timeframe: '3-6 months (with pharmacotherapy)',
        priority: 'HIGH'
      });
    }

    return goals;
  }
}
