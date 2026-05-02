import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./translations";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  isTranslating: boolean;
}

const Ctx = createContext<I18nCtx | undefined>(undefined);

const isLang = (v: string | null): v is Lang => v === "en" || v === "hi" || v === "mr";

const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

const BCP47: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

// SEO: keep <html lang>, og:locale, hreflang alternates in sync with the active language
const updateSeoLanguageTags = (lang: Lang) => {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.lang = BCP47[lang];
  html.setAttribute("dir", "ltr");

  const upsertMeta = (selector: string, attrs: Record<string, string>) => {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = document.createElement("meta");
      document.head.appendChild(el);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  };

  upsertMeta('meta[property="og:locale"]', {
    property: "og:locale",
    content: BCP47[lang].replace("-", "_"),
  });
  upsertMeta('meta[name="content-language"]', {
    name: "content-language",
    content: BCP47[lang],
  });

  // hreflang alternates — point each to the current URL with a ?lang= hint
  const url = new URL(window.location.href);
  url.searchParams.delete("lang");
  document.head
    .querySelectorAll('link[rel="alternate"][data-i18n="1"]')
    .forEach((l) => l.remove());
  (Object.keys(BCP47) as Lang[]).forEach((code) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", BCP47[code]);
    const u = new URL(url.toString());
    u.searchParams.set("lang", code);
    link.setAttribute("href", u.toString());
    link.setAttribute("data-i18n", "1");
    document.head.appendChild(link);
  });
  const xDefault = document.createElement("link");
  xDefault.setAttribute("rel", "alternate");
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.setAttribute("href", url.toString());
  xDefault.setAttribute("data-i18n", "1");
  document.head.appendChild(xDefault);
};

// Drive the Google Translate widget. Returns true when a reload is needed.
const applyGoogleTranslate = (lang: Lang): boolean => {
  if (typeof document === "undefined") return false;
  const value = lang === "en" ? "/en/en" : `/en/${lang}`;
  const host = window.location.hostname;
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; expires=${expire}; path=/`;
  document.cookie = `googtrans=; expires=${expire}; path=/; domain=${host}`;
  document.cookie = `googtrans=; expires=${expire}; path=/; domain=.${host}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}`;
  document.cookie = `googtrans=${value}; path=/; domain=.${host}`;
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
    return false;
  }
  return true;
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("en");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sbai-lang");
    if (isLang(saved)) {
      setLangState(saved);
      updateSeoLanguageTags(saved);
    } else {
      updateSeoLanguageTags("en");
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (isLang(detail)) setLangState(detail);
    };
    window.addEventListener("sbai-lang-change", handler);
    return () => window.removeEventListener("sbai-lang-change", handler);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setIsTranslating(true);
    setLangState(l);
    localStorage.setItem("sbai-lang", l);
    updateSeoLanguageTags(l);
    window.dispatchEvent(new CustomEvent("sbai-lang-change", { detail: l }));
    const needsReload = applyGoogleTranslate(l);
    if (needsReload) {
      // Keep overlay visible until the reload swaps the page
      setTimeout(() => window.location.reload(), 80);
      return;
    }
    window.setTimeout(() => setIsTranslating(false), 900);
  }, []);

  const t = useCallback(
    (key: TKey) => {
      const dict = translations[lang] as Record<string, string>;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t, isTranslating }}>
      {children}
      {isTranslating && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in notranslate"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-card border border-border shadow-elevated">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-foreground">
              Translating to {LANG_NAMES[lang]}…
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
