import { SupportedLanguage } from './LanguageProfile';

export interface VernacularHealthSummary {
  language: SupportedLanguage;
  headline: string;
  summaryText: string;
  keyActionMessage: string;
  readingGradeLevel: string; // e.g. 'Grade 6-8'
}
