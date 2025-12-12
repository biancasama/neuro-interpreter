
import { Language } from '../types';

export const LANGUAGE_MAP: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ar: 'Arabic'
};

export class LanguageManager {
  private static STORAGE_KEY = 'neuro_sense_lang_pref';

  /**
   * Retrieves the saved language from LocalStorage, defaults to 'en'.
   */
  static getSavedLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      // Validate that the saved string is actually a supported language key
      if (saved && LANGUAGE_MAP.hasOwnProperty(saved)) {
        return saved as Language;
      }
    } catch (e) {
      console.warn("Could not read language preference", e);
    }
    return 'en';
  }

  /**
   * Persists the user's language choice.
   */
  static saveLanguage(lang: Language): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not save language preference", e);
    }
  }

  /**
   * Returns the English name of the language for the System Prompt (e.g., 'es' -> 'Spanish').
   * This is critical for telling Gemini which language to reply in.
   */
  static getGeminiTargetLanguage(lang: Language): string {
    return LANGUAGE_MAP[lang] || 'English';
  }
}
