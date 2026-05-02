import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./translations";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const Ctx = createContext<I18nCtx | undefined>(undefined);

const isLang = (v: string | null): v is Lang => v === "en" || v === "hi" || v === "mr";

// Drive the Google Translate widget by setting its cookie + selecting the lang in the hidden combo.
const applyGoogleTranslate = (lang: Lang) => {
  if (typeof document === "undefined") return;
  const value = lang === "en" ? "/en/en" : `/en/${lang}`;
  const host = window.location.hostname;
  // Clear existing cookies on all relevant scopes.
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; expires=${expire}; path=/`;
  document.cookie = `googtrans=; expires=${expire}; path=/; domain=${host}`;
  document.cookie = `googtrans=; expires=${expire}; path=/; domain=.${host}`;
  // Set new cookies.
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}`;
  document.cookie = `googtrans=${value}; path=/; domain=.${host}`;
  // Try the in-page combo as a fast path; otherwise reload.
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  } else {
    // Defer one tick so cookie is written before reload.
    setTimeout(() => window.location.reload(), 50);
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sbai-lang");
    if (isLang(saved)) {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (isLang(detail)) setLangState(detail);
    };
    window.addEventListener("sbai-lang-change", handler);
    return () => window.removeEventListener("sbai-lang-change", handler);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("sbai-lang", l);
    document.documentElement.lang = l;
    window.dispatchEvent(new CustomEvent("sbai-lang-change", { detail: l }));
    applyGoogleTranslate(l);
  }, []);

  const t = useCallback(
    (key: TKey) => {
      const dict = translations[lang] as Record<string, string>;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};