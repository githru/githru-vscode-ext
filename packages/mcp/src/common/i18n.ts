import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class I18nManager {
  private currentLocale = 'en';
  private translations: Record<string, any> = {};
  private fallbackTranslations: Record<string, any> = {};

  constructor() {
    this.loadFallback();
  }

  private loadFallback() {
    try {
      const fallbackPath = path.join(__dirname, '../locales/en.json');
      const fallbackData = fs.readFileSync(fallbackPath, 'utf-8');
      this.fallbackTranslations = JSON.parse(fallbackData);
      this.translations = this.fallbackTranslations;
    } catch (error) {
      console.error('Failed to load fallback translations:', error);
      this.fallbackTranslations = {};
      this.translations = {};
    }
  }

  setLocale(locale: string) {
    this.currentLocale = locale;
    
    if (locale === 'en') {
      this.translations = this.fallbackTranslations;
      return;
    }

    try {
      const localePath = path.join(__dirname, `../locales/${locale}.json`);
      const localeData = fs.readFileSync(localePath, 'utf-8');
      this.translations = JSON.parse(localeData);
    } catch (error) {
      console.error(`Locale '${locale}' not found, using English fallback`);
      this.translations = this.fallbackTranslations;
    }
  }

  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = this.translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value && this.currentLocale !== 'en') {
      value = this.fallbackTranslations;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    if (!value || typeof value !== 'string') {
      return key;
    }
    
    const stringValue = value as string;
    
    if (params) {
      return stringValue.replace(/\{(\w+)\}/g, (match: string, param: string) => 
        params[param]?.toString() ?? match
      );
    }
    
    return stringValue;
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }
}

export const I18n = new I18nManager();
