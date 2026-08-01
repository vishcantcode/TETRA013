import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { DietRecommendation } from '../interfaces/LifestylePlan';

export class NutritionPlanner {
  public static generateDietPlan(assessment: UnifiedRiskAssessment): DietRecommendation {
    const f = assessment.snapshot.features;

    if (f.egfr !== null && f.egfr < 60) {
      return {
        category: 'Kidney Protection',
        primaryFocus: 'Protein and Potassium Control for Kidney Protection',
        recommendedFoods: ['White rice in moderation', 'Bottle gourd (Lauki)', 'Ridge gourd (Turai)', 'Apple', 'Papaya'],
        foodsToAvoid: ['High-protein supplements', 'Red meat', 'Extra table salt', 'High-potassium raw salads (spinach/tomatoes)'],
        hydrationTarget: '1.5 to 2.0 Liters daily (consult doctor if swelling present)'
      };
    }

    if (f.hba1c !== null && f.hba1c >= 6.5) {
      return {
        category: 'Glycemic Control',
        primaryFocus: 'Low Glycemic Index & High Fiber Indian Diet',
        recommendedFoods: ['Millets (Jowar, Bajra, Ragi)', 'Whole pulses (Chana, Rajma, Moong)', 'Green leafy vegetables', 'Sprouted grains'],
        foodsToAvoid: ['White bread, refined flour (Maida)', 'Sugary beverages and sweets', 'Fruit juices', 'Fried snacks (Samosa, Pakora)'],
        hydrationTarget: '2.5 to 3.0 Liters water daily'
      };
    }

    if (f.systolicBP !== null && f.systolicBP >= 140) {
      return {
        category: 'Sodium Restriction',
        primaryFocus: 'DASH Diet & Sodium Restriction (< 2g/day)',
        recommendedFoods: ['Bananas', 'Potassium-rich vegetables', 'Low-fat curd', 'Oats', 'Unsalted nuts'],
        foodsToAvoid: ['Pickles (Achar)', 'Papads', 'Packaged salty chips', 'Processed sauces'],
        hydrationTarget: '2.5 Liters water daily'
      };
    }

    return {
      category: 'Cardioprotective',
      primaryFocus: 'Balanced Preventive Nutrition',
      recommendedFoods: ['Fresh vegetables', 'Whole fruits', 'Whole grains', 'Lentils'],
      foodsToAvoid: ['Deep fried foods', 'Excess refined sugar'],
      hydrationTarget: '2.5 Liters water daily'
    };
  }
}
