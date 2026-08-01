import { SupportedLanguage } from '../interfaces/LanguageProfile';
import { VernacularHealthSummary } from '../interfaces/PatientSummary';
import { AudioGuidancePayload } from '../interfaces/EducationPlan';

export class AudioAdviceService {
  public static prepareAudioPayload(
    summary: VernacularHealthSummary,
    language: SupportedLanguage
  ): AudioGuidancePayload {
    const scriptText = `${summary.headline}. ${summary.summaryText} ${summary.keyActionMessage}`;
    const wordCount = scriptText.split(/\s+/).length;
    const estimatedDurationSeconds = Math.max(10, Math.round(wordCount / 2.5)); // ~150 wpm

    return {
      language,
      scriptText,
      estimatedDurationSeconds,
      readyForTTS: true
    };
  }
}
