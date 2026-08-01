import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ReferralDecision } from '@healthsense/clinical-referrals';
import { CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { SupportedLanguage } from '../interfaces/LanguageProfile';
import { PersonalizedEducationPlan } from '../interfaces/EducationPlan';
import { VernacularHealthSummary } from '../interfaces/PatientSummary';
import { LifestyleEngine } from './LifestyleEngine';
import { HealthCoachEngine } from './HealthCoachEngine';
import { ReminderScheduler } from '../services/ReminderScheduler';
import { PDFEducationGenerator } from '../services/PDFEducationGenerator';
import { AudioAdviceService } from '../services/AudioAdviceService';

export class EducationEngine {
  private lifestyleEngine = new LifestyleEngine();
  private healthCoachEngine = new HealthCoachEngine();

  public generateEducationPlan(
    assessment: UnifiedRiskAssessment,
    explainabilityReport?: CompleteExplainabilityReport,
    referralDecision?: ReferralDecision,
    language: SupportedLanguage = 'en'
  ): PersonalizedEducationPlan {
    const patientId = assessment.patientId;
    const createdAt = new Date().toISOString();

    // 1. Vernacular Health Summary
    const vernacularTexts = explainabilityReport?.patientVernacularSummaries || {
      en: 'Your vital signs and blood test results are in good standing.',
      hi: 'आपकी रिपोर्ट और स्वास्थ्य संकेत अच्छे हैं।',
      gu: 'તમારું સ્વાસ્થ્ય અને બ્લડ રિપોર્ટ સારા છે.'
    };

    const summary: VernacularHealthSummary = {
      language,
      headline: assessment.overallRiskScore >= 75 ? 'Important Health Notice' : assessment.overallRiskScore >= 40 ? 'Moderate Health Attention Required' : 'Good Health Status',
      summaryText: (vernacularTexts as any)[language] || vernacularTexts.en,
      keyActionMessage: assessment.overallRiskScore >= 75 ? 'Schedule specialist review and monitor symptoms daily.' : 'Maintain active lifestyle and balanced diet.',
      readingGradeLevel: 'Grade 6-8'
    };

    // 2. Lifestyle & Nutrition Plan
    const lifestylePlan = this.lifestyleEngine.generateLifestylePlan(assessment);

    // 3. Reminders & Appointment Schedule
    const reminderPlan = ReminderScheduler.scheduleReminders(assessment, referralDecision);

    // 4. Action Plan & Red Flags
    const actionPlan = this.healthCoachEngine.generateActionPlan(assessment, language);

    // 5. Audio Guidance Payload
    const audioGuidance = AudioAdviceService.prepareAudioPayload(summary, language);

    // Assemble Initial Plan
    const planWithoutHtml: Omit<PersonalizedEducationPlan, 'printableSheetHtml'> = {
      patientId,
      createdAt,
      selectedLanguage: language,
      summary,
      lifestylePlan,
      reminderPlan,
      actionPlan,
      audioGuidance
    };

    // 6. Generate Printable HTML Sheet
    const printableSheetHtml = PDFEducationGenerator.generatePrintableHTML({
      ...planWithoutHtml,
      printableSheetHtml: ''
    });

    return {
      ...planWithoutHtml,
      printableSheetHtml
    };
  }
}

export const educationEngine = new EducationEngine();
