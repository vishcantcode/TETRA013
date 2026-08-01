export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'ta' | 'mr';

export interface LanguageProfile {
  code: SupportedLanguage;
  displayName: string;
  nativeName: string;
  isRTL: boolean;
}
