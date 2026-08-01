export interface DietRecommendation {
  category: 'Glycemic Control' | 'Sodium Restriction' | 'Kidney Protection' | 'Cardioprotective';
  primaryFocus: string;
  recommendedFoods: string[];
  foodsToAvoid: string[];
  hydrationTarget: string;
}

export interface ExerciseRecommendation {
  type: 'Aerobic Walking' | 'Yoga & Stretching' | 'Light Activity';
  weeklyFrequency: string;
  durationMinutesPerSession: number;
  precautions: string[];
}

export interface LifestylePlan {
  diet: DietRecommendation;
  exercise: ExerciseRecommendation;
  sleepTargetHours: string;
  weightManagementGoal: string;
  smokingCessationAdvice?: string;
  alcoholReductionAdvice?: string;
  stressManagementAdvice: string;
}
