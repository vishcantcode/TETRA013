import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ActionPlanGoals } from '../interfaces/EducationPlan';
import { LOCALIZATION_DICTIONARY } from '../utils/Localization';
import { SupportedLanguage } from '../interfaces/LanguageProfile';

export class HealthCoachEngine {
  public generateActionPlan(
    assessment: UnifiedRiskAssessment,
    language: SupportedLanguage = 'en'
  ): ActionPlanGoals {
    const f = assessment.snapshot.features;
    const dict = LOCALIZATION_DICTIONARY[language] || LOCALIZATION_DICTIONARY.en;

    const topThreePriorities: string[] = [];
    const redFlagSymptoms: string[] = [];

    if (f.systolicBP !== null && f.systolicBP >= 160) {
      topThreePriorities.push('Immediate Blood Pressure Control');
      redFlagSymptoms.push('Severe throbbing headache or dizziness');
      redFlagSymptoms.push('Chest tightness, pain, or difficulty breathing');
    }

    if (f.hba1c !== null && f.hba1c >= 8.0) {
      topThreePriorities.push('Glycemic Control & Medication Titration');
      redFlagSymptoms.push('Extreme thirst, confusion, or rapid deep breathing');
    }

    if (f.egfr !== null && f.egfr < 60) {
      topThreePriorities.push('Kidney Protection & Hydration Management');
      redFlagSymptoms.push('Sudden swelling in feet, legs, or puffiness around eyes');
      redFlagSymptoms.push('Nausea, vomiting, or significant decrease in urine output');
    }

    if (topThreePriorities.length === 0) {
      topThreePriorities.push('Maintain Healthy Diet & Regular Walking');
      topThreePriorities.push('Schedule Annual Preventive Health Checkup');
      topThreePriorities.push('Keep Stress Levels Low');
      redFlagSymptoms.push('Unexplained weight loss or chronic fatigue');
    }

    return {
      topThreePriorities,
      dailyGoals: [
        'Take all prescribed medications on time',
        'Walk 30 minutes or practice light exercise',
        'Drink adequate water and limit extra salt/sugar'
      ],
      weeklyGoals: [
        'Check blood pressure twice weekly',
        'Inspect feet daily for any minor cuts or redness',
        'Review food choices to ensure whole grains and vegetables'
      ],
      monthlyFollowupGoals: [
        'Attend scheduled doctor or specialist consultation',
        'Complete repeat blood/urine tests if ordered'
      ],
      redFlagSymptoms,
      emergencyContactInstructions: dict.EMERGENCY_CONTACT
    };
  }
}
