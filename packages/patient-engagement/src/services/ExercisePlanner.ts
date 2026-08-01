import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ExerciseRecommendation } from '../interfaces/LifestylePlan';

export class ExercisePlanner {
  public static generateExercisePlan(assessment: UnifiedRiskAssessment): ExerciseRecommendation {
    const f = assessment.snapshot.features;

    if ((f.systolicBP !== null && f.systolicBP >= 160) || (f.egfr !== null && f.egfr < 30)) {
      return {
        type: 'Light Activity',
        weeklyFrequency: '3 to 5 days weekly',
        durationMinutesPerSession: 15,
        precautions: ['Avoid strenuous lifting', 'Stop immediately if feeling lightheaded or breathless', 'Consult physician before starting']
      };
    }

    if (f.hba1c !== null && f.hba1c >= 6.5) {
      return {
        type: 'Aerobic Walking',
        weeklyFrequency: '5 days weekly',
        durationMinutesPerSession: 30,
        precautions: ['Inspect feet daily for blisters/cuts before and after walking', 'Wear comfortable cushioned footwear', 'Carry glucose candy in case of hypoglycemia']
      };
    }

    return {
      type: 'Yoga & Stretching',
      weeklyFrequency: '5 days weekly',
      durationMinutesPerSession: 30,
      precautions: ['Stay well hydrated', 'Warm up for 5 minutes before exercise']
    };
  }
}
