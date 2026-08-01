export type SupportedLanguage = 'en' | 'hi' | 'gu';

export interface LanguageProfile {
  code: SupportedLanguage;
  displayName: string;
  nativeName: string;
  isRTL: boolean;
}
