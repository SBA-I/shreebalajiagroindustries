import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./translations";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const Ctx = createContext<I18nCtx | undefined>(undefined);

const isLang = (v: string | null): v is Lang => v === "en" || v === "hi" || v === "mr";

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