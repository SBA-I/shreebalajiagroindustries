import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "HI", name: "हिन्दी" },
  { code: "mr", label: "MR", name: "मराठी" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

const LanguageBar = () => {
  const [lang, setLang] = useState<LangCode>("en");

  useEffect(() => {
    const saved = (localStorage.getItem("sbai-lang") as LangCode | null) ?? "en";
    setLang(saved);
    document.documentElement.lang = saved;
  }, []);

  const change = (code: LangCode) => {
    setLang(code);
    localStorage.setItem("sbai-lang", code);
    document.documentElement.lang = code;
    window.dispatchEvent(new CustomEvent("sbai-lang-change", { detail: code }));
  };

  return (
    <div className="w-full bg-primary/95 text-primary-foreground text-xs">
      <div className="container mx-auto px-4 lg:px-8 h-8 flex items-center justify-end gap-2">
        <Globe className="h-3.5 w-3.5 opacity-80" aria-hidden />
        <span className="opacity-80 hidden sm:inline">Language:</span>
        <div className="flex items-center gap-1" role="group" aria-label="Language selection">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              aria-pressed={lang === l.code}
              title={l.name}
              className={`px-2 py-0.5 rounded transition-colors ${
                lang === l.code
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "hover:bg-primary-foreground/10"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageBar;