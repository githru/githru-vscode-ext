import { resolveAssetDir, makeAssetResolver, getDirname } from "./assetResolver.js";

type Translations = Record<string, any>;

class I18nManager {
  private currentLocale: "en" | "ko" = "en";
  private translations: Translations = {};
  private fallbackTranslations: Translations = {};
  private initialized = false;

  private initOnce() {
    if (this.initialized) return;

    // === 여기서만 로케일 디렉토리 해석 (lazy) ===
    const LOCALES_DIR = resolveAssetDir({
      envVar: "GITHRU_LOCALES_DIR",
      callerDirname: getDirname(),
      callerMetaUrl: import.meta.url,
      moduleAnchors: ["resources/locales"],
      packageAnchors: ["dist/resources/locales", "resources/locales", "src/resources/locales"],
      requiredFiles: ["en.json"],
      tryRequireResolve: { request: "./resources/locales/en.json" },
      debugEnvVar: "SHOW_ASSET_LOG",
    });

    const locales = makeAssetResolver(LOCALES_DIR);

    try {
      const fallbackData = locales.readText("en.json");
      this.fallbackTranslations = JSON.parse(fallbackData);
      this.translations = this.fallbackTranslations;
    } catch (e) {
      console.error("Failed to load fallback translations:", e);
      this.fallbackTranslations = {};
      this.translations = {};
    }

    this.initialized = true;
  }

  setLocale(locale: "en" | "ko") {
    this.initOnce();
    this.currentLocale = locale;

    if (locale === "en") {
      this.translations = this.fallbackTranslations;
      return;
    }

    try {
      // initOnce 에서 만든 locales resolver를 다시 만들지 않도록
      const LOCALES_DIR = resolveAssetDir({
        envVar: "GITHRU_LOCALES_DIR",
        callerDirname: getDirname(),
        callerMetaUrl: import.meta.url,
        moduleAnchors: ["resources/locales"],
        packageAnchors: ["dist/resources/locales", "resources/locales", "src/resources/locales"],
        requiredFiles: ["en.json"],
      });
      const locales = makeAssetResolver(LOCALES_DIR);

      const localeData = locales.readText(`${locale}.json`);
      this.translations = JSON.parse(localeData);
    } catch (e) {
      console.error(`Locale '${locale}' not found, using English fallback`);
      this.translations = this.fallbackTranslations;
    }
  }

  t(key: string, params?: Record<string, any>): string {
    this.initOnce();
    const keys = key.split(".");
    let v: any = this.translations;
    for (const k of keys) v = v?.[k];

    if (!v && this.currentLocale !== "en") {
      v = this.fallbackTranslations;
      for (const k of keys) v = v?.[k];
    }
    if (!v || typeof v !== "string") return key;

    return params ? (v as string).replace(/\{(\w+)\}/g, (_, p) => params[p]?.toString() ?? `{${p}}`) : (v as string);
  }

  getCurrentLocale() {
    this.initOnce();
    return this.currentLocale;
  }
}

let _i18n: I18nManager | null = null;
export function getI18n() {
  if (!_i18n) _i18n = new I18nManager();
  return _i18n;
}
