// ============================================================================
// HPPHI – Capability 5: Preventive Health Score Framework
// ============================================================================

import { HPPHIPatientInput, HPPHIPreventiveHealthScore, HPPHIHealthScoreComponent } from './types';

interface ScoreRule {
  factor: string;
  weight: number;
  compute: (patient: HPPHIPatientInput) => number; // returns 0-100
  improvementHint: (score: number) => string | undefined;
}

const SCORE_RULES: ScoreRule[] = [
  {
    factor: 'Blood Pressure Control',
    weight: 0.15,
    compute: (p) => {
      const sys = p.vitalSigns.find(v => v.metric === 'Systolic BP')?.value ?? 120;
      if (sys < 120) return 100;
      if (sys < 130) return 85;
      if (sys < 140) return 65;
      if (sys < 160) return 40;
      return 20;
    },
    improvementHint: (s) => s < 70 ? 'Improve blood pressure through medication adherence, DASH diet, and sodium restriction.' : undefined
  },
  {
    factor: 'Glycemic Control',
    weight: 0.12,
    compute: (p) => {
      const hba1c = p.laboratoryResults.find(l => l.test === 'HbA1c')?.value;
      if (hba1c === undefined) return 80; // no data = assume OK
      if (hba1c < 5.7) return 100;
      if (hba1c < 6.5) return 75;
      if (hba1c < 7.5) return 55;
      if (hba1c < 9.0) return 35;
      return 15;
    },
    improvementHint: (s) => s < 70 ? 'Improve glycemic control with medication intensification and dietary carbohydrate management.' : undefined
  },
  {
    factor: 'Cholesterol Management',
    weight: 0.10,
    compute: (p) => {
      const ldl = p.laboratoryResults.find(l => l.test === 'LDL')?.value;
      if (ldl === undefined) return 80;
      if (ldl < 100) return 100;
      if (ldl < 130) return 80;
      if (ldl < 160) return 55;
      return 30;
    },
    improvementHint: (s) => s < 70 ? 'Improve cholesterol with statin therapy and dietary changes (reduce saturated fat).' : undefined
  },
  {
    factor: 'Body Mass Index',
    weight: 0.10,
    compute: (p) => {
      const bmi = p.laboratoryResults.find(l => l.test === 'BMI')?.value;
      if (bmi === undefined) return 80;
      if (bmi >= 18.5 && bmi < 25) return 100;
      if (bmi >= 25 && bmi < 30) return 65;
      if (bmi >= 30 && bmi < 35) return 40;
      return 20;
    },
    improvementHint: (s) => s < 70 ? 'Achieve weight loss through caloric deficit, regular exercise, and behavioral interventions.' : undefined
  },
  {
    factor: 'Physical Activity',
    weight: 0.12,
    compute: (p) => {
      const mins = p.lifestyleFactors.physicalActivityMinPerWeek;
      if (mins >= 300) return 100;
      if (mins >= 150) return 80;
      if (mins >= 75) return 55;
      return 25;
    },
    improvementHint: (s) => s < 70 ? 'Increase weekly physical activity to ≥150 minutes of moderate-intensity exercise.' : undefined
  },
  {
    factor: 'Tobacco Use',
    weight: 0.13,
    compute: (p) => {
      if (p.lifestyleFactors.smokingStatus === 'NEVER') return 100;
      if (p.lifestyleFactors.smokingStatus === 'FORMER') return 80;
      return 10; // CURRENT
    },
    improvementHint: (s) => s < 50 ? 'Quit smoking — the single most impactful preventive health action.' : undefined
  },
  {
    factor: 'Sleep Quality',
    weight: 0.08,
    compute: (p) => {
      const hrs = p.lifestyleFactors.sleepHoursPerNight;
      if (hrs >= 7 && hrs <= 9) return 100;
      if (hrs >= 6) return 70;
      if (hrs >= 5) return 45;
      return 20;
    },
    improvementHint: (s) => s < 70 ? 'Improve sleep hygiene: consistent schedule, reduce screen time, cool dark bedroom.' : undefined
  },
  {
    factor: 'Stress Management',
    weight: 0.08,
    compute: (p) => {
      if (p.lifestyleFactors.stressLevel === 'LOW') return 100;
      if (p.lifestyleFactors.stressLevel === 'MODERATE') return 65;
      return 30; // HIGH
    },
    improvementHint: (s) => s < 60 ? 'Implement stress reduction techniques: mindfulness, meditation, or counseling.' : undefined
  },
  {
    factor: 'Preventive Screening Compliance',
    weight: 0.07,
    compute: (p) => {
      if (p.previousScreenings.length === 0) return 40;
      const now = Date.now();
      const overdueCount = p.previousScreenings.filter(s =>
        (now - s.lastDate.getTime()) > (365 * 2 * 24 * 60 * 60 * 1000) // >2 years
      ).length;
      const compliance = 1 - (overdueCount / p.previousScreenings.length);
      return Math.round(compliance * 100);
    },
    improvementHint: (s) => s < 70 ? 'Schedule overdue preventive screenings.' : undefined
  },
  {
    factor: 'Alcohol Use',
    weight: 0.05,
    compute: (p) => {
      const drinks = p.lifestyleFactors.alcoholUsePerWeek;
      if (drinks === 0) return 100;
      if (drinks <= 7) return 85;
      if (drinks <= 14) return 60;
      return 25;
    },
    improvementHint: (s) => s < 70 ? 'Reduce alcohol consumption to ≤7 drinks/week.' : undefined
  }
];

export class HPPHIHealthScoreEngine {

  public compute(patient: HPPHIPatientInput): HPPHIPreventiveHealthScore {
    const components: HPPHIHealthScoreComponent[] = [];
    let weightedSum = 0;
    let totalWeight = 0;

    for (const rule of SCORE_RULES) {
      const score = rule.compute(patient);
      const status = score >= 75 ? 'STRENGTH' : score >= 50 ? 'NEUTRAL' : 'WEAKNESS';
      const improvement = rule.improvementHint(score);

      components.push({
        factor: rule.factor,
        score,
        weight: rule.weight,
        status,
        improvementOpportunity: improvement
      });

      weightedSum += score * rule.weight;
      totalWeight += rule.weight;
    }

    const overallScore = Math.round(totalWeight > 0 ? weightedSum / totalWeight : 0);

    let grade: HPPHIPreventiveHealthScore['grade'] = 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 60) grade = 'C';
    else if (overallScore >= 45) grade = 'D';

    const strengths = components.filter(c => c.status === 'STRENGTH').map(c => c.factor);
    const weaknesses = components.filter(c => c.status === 'WEAKNESS').map(c => c.factor);
    const topActions = components
      .filter(c => c.improvementOpportunity)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(c => c.improvementOpportunity!);

    return {
      overallScore,
      grade,
      components,
      strengths,
      weaknesses,
      topImprovementActions: topActions
    };
  }
}
