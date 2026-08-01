// ============================================================================
// HECIT – Capability 8: Patient-Friendly Explanation Generator
// ============================================================================

import { HECITPatientExplanation } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITPatientExplanationEngine {

  public generatePatientExplanation(profile: HPPMCareProfile): HECITPatientExplanation {
    const sysBp = profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    const hba1c = profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value;

    const simpleSummary =
      `Here is a simple summary of your health update today. Your blood pressure is slightly high (${sysBp ?? 138} mmHg), ` +
      `and your blood sugar score is ${hba1c ?? 7.4}%. Your medical team recommends staying on your current medicine once a day ` +
      `and adding light daily walks to help protect your heart and kidneys.`;

    const whyThisIsRecommended = [
      'Keeping your blood pressure under control protects your blood vessels, heart, and kidneys.',
      'Taking your medicine consistently every day helps keep your blood sugar steady.',
      'Light walking is a safe and effective way to lower blood pressure naturally.',
    ];

    const whatYouShouldDoNext = [
      'Take your daily medicine at the same time each morning.',
      'Aim for 20-30 minutes of brisk walking 4-5 times a week.',
      'Keep track of your blood pressure numbers if you have a home monitor.',
    ];

    const keyQuestionsToAskYourDoctor = [
      'Is my current blood pressure medicine working well for me?',
      'Are there any side effects I should watch out for?',
      'When should I schedule my next blood test?',
    ];

    const lifestyleTips = [
      'Try reducing sodium (salt) in your meals by using fresh herbs or spices.',
      'Drink plenty of water throughout the day.',
      'Aim for 7 to 8 hours of restful sleep every night.',
    ];

    return {
      patientId: profile.patientId,
      simpleSummary,
      whyThisIsRecommended,
      whatYouShouldDoNext,
      keyQuestionsToAskYourDoctor,
      lifestyleTips,
    };
  }
}
