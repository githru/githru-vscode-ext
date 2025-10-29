import { getDirname, makeAssetResolver, resolveAssetDir } from "./assetResolver.js";

const LOCALES_DIR = resolveAssetDir({
  envVar: "GITHRU_LOCALES_DIR",
  callerDirname: getDirname(),
  callerMetaUrl: import.meta.url,
  moduleAnchors: ["resources/locales"],
  packageAnchors: ["dist/resources/locales", "resources/locales", "src/resources/locales"],
  requiredFiles: ["en.json"],
  tryRequireResolve: { request: "./resources/locales/en.json" },
});

const locales = makeAssetResolver(LOCALES_DIR);

class I18nManager {
  private currentLocale = "en";
  private translations: Record<string, any> = {};
  private fallbackTranslations: Record<string, any> = {};

  constructor() {
    this.loadFallback();
  }

  private loadFallback() {
    try {
      const fallbackData = locales.readText("en.json");
      this.fallbackTranslations = JSON.parse(fallbackData);
      this.translations = this.fallbackTranslations;
    } catch (error) {
      console.error("Failed to load fallback translations:", error);
      this.fallbackTranslations = {};
      this.translations = {};
    }
  }

  setLocale(locale: string) {
    this.currentLocale = locale;

    if (locale === "en") {
      this.translations = this.fallbackTranslations;
      return;
    }

    try {
      const localeData = locales.readText(`${locale}.json`);
      this.translations = JSON.parse(localeData);
    } catch (error) {
      console.error(`Locale '${locale}' not found, using English fallback`);
      this.translations = this.fallbackTranslations;
    }
  }

  t(key: string, params?: Record<string, any>): string {
    const keys = key.split(".");
    let value: any = this.translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value && this.currentLocale !== "en") {
      value = this.fallbackTranslations;
      for (const k of keys) {
        value = value?.[k];
      }
    }

    if (!value || typeof value !== "string") {
      return key;
    }

    const stringValue = value as string;

    if (params) {
      return stringValue.replace(/\{(\w+)\}/g, (match: string, param: string) => params[param]?.toString() ?? match);
    }

    return stringValue;
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }
}

export const I18n = new I18nManager();
