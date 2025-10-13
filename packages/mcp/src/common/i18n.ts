import * as fs from "fs";
import * as path from "path";
import { getDirname } from "./utils.js";

const __dirname = getDirname();

function findLocalesDir(): string {
  const cands = [
    path.resolve(__dirname, "../resources/locales"),
    path.resolve(__dirname, "../../resources/locales"),
    path.resolve(process.cwd(), "src/resources/locales"),
    path.resolve(process.cwd(), "resources/locales"),
  ];
  for (const p of cands) {
    if (fs.existsSync(path.join(p, "en.json"))) return p;
  }
  throw new Error("Cannot locate locales directory. Tried:\n" + cands.map((p) => " - " + p).join("\n"));
}

const LOCALES_DIR = findLocalesDir();

class I18nManager {
  private currentLocale = "en";
  private translations: Record<string, any> = {};
  private fallbackTranslations: Record<string, any> = {};

  constructor() {
    this.loadFallback();
  }

  private loadFallback() {
    try {
      const fallbackPath = path.join(LOCALES_DIR, "en.json");
      const fallbackData = fs.readFileSync(fallbackPath, "utf-8");
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
      const localePath = path.join(LOCALES_DIR, `${locale}.json`);
      const localeData = fs.readFileSync(localePath, "utf-8");
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
