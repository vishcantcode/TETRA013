import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { LifestylePlan } from '../interfaces/LifestylePlan';
import { NutritionPlanner } from '../services/NutritionPlanner';
import { ExercisePlanner } from '../services/ExercisePlanner';

export class LifestyleEngine {
  public generateLifestylePlan(assessment: UnifiedRiskAssessment): LifestylePlan {
    const f = assessment.snapshot.features;
    const diet = NutritionPlanner.generateDietPlan(assessment);
    const exercise = ExercisePlanner.generateExercisePlan(assessment);

    return {
      diet,
      exercise,
      sleepTargetHours: '7 to 8 hours uninterrupted sleep nightly',
      weightManagementGoal: f.bmi !== null && f.bmi >= 25 ? 'Target 5-7% gradual weight reduction' : 'Maintain current healthy weight',
      smokingCessationAdvice: f.smoking ? 'Complete tobacco cessation recommended. Ask doctor about nicotine replacement options.' : undefined,
      alcoholReductionAdvice: f.alcohol ? 'Limit alcohol intake to prevent hypertension & metabolic strain.' : undefined,
      stressManagementAdvice: 'Practice 15 minutes of deep breathing or meditation daily to assist blood pressure control.'
    };
  }
}
