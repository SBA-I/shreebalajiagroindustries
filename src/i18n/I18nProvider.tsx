import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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

const GOOGLE_TARGET_LANG: Record<Lang, string> = {
  en: "",
  hi: "hi",
  mr: "mr",
};

// SEO: keep <html lang>, og:locale, hreflang in sync
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
};

const setGoogTransCookie = (lang: Lang) => {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  ["/", ""].forEach((p) => {
    const path = p || "/";
    document.cookie = `googtrans=; expires=${expire}; path=${path}`;
    document.cookie = `googtrans=; expires=${expire}; path=${path}; domain=${host}`;
    document.cookie = `googtrans=; expires=${expire}; path=${path}; domain=.${host}`;
  });
  if (lang === "en") return;
  const value = `/en/${lang}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}`;
  document.cookie = `googtrans=${value}; path=/; domain=.${host}`;
};

const normalizeTranslateLayout = () => {
  if (typeof document === "undefined") return;
  document.body.style.top = "0px";
  document.body.style.position = "static";
};

const triggerCombo = (lang: Lang): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const tryNow = () => {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = GOOGLE_TARGET_LANG[lang];
        combo.dispatchEvent(new Event("change", { bubbles: true }));
        window.setTimeout(normalizeTranslateLayout, 150);
        window.setTimeout(normalizeTranslateLayout, 600);
        resolve(true);
        return;
      }
      if (++attempts > 30) {
        resolve(false);
        return;
      }
      setTimeout(tryNow, 200);
    };
    tryNow();
  });
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("sbai-lang");
    return isLang(saved) ? saved : "en";
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<Lang>(lang);
  const translatingTimer = useRef<number | null>(null);

  const applyGoogleFallback = useCallback(async (l: Lang) => {
    setGoogTransCookie(l);
    if (l === "en") return true;
    const ok = await triggerCombo(l);
    normalizeTranslateLayout();
    return ok;
  }, []);

  // Initial mount: sync SEO + Google fallback
  useEffect(() => {
    updateSeoLanguageTags(lang);
    void applyGoogleFallback(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On route change while non-English, re-trigger google fallback for any unkeyed text
  useEffect(() => {
    if (lang === "en") return;
    const t = window.setTimeout(() => {
      void applyGoogleFallback(lang);
    }, 300);
    return () => window.clearTimeout(t);
  }, [lang, location.pathname, location.search, applyGoogleFallback]);

  const setLang = useCallback(async (l: Lang) => {
    if (l === lang) return;
    setTargetLang(l);
    setIsTranslating(true);
    localStorage.setItem("sbai-lang", l);
    updateSeoLanguageTags(l);
    setGoogTransCookie(l);

    // Switching to or from non-English: hard reload to fully reset Google Translate state
    // This prevents HI showing MR (or vice versa) due to stale cookie/state
    if (lang !== "en" || l !== "en") {
      window.setTimeout(() => window.location.reload(), 100);
      return;
    }

    setLangState(l);
    if (translatingTimer.current) window.clearTimeout(translatingTimer.current);
    translatingTimer.current = window.setTimeout(() => {
      setIsTranslating(false);
      translatingTimer.current = null;
    }, 400);
  }, [lang]);

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
              Loading {LANG_NAMES[targetLang]}…
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
