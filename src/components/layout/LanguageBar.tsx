import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/translations";

const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "HI", name: "हिन्दी" },
  { code: "mr", label: "MR", name: "मराठी" },
];

const LanguageBar = () => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="w-full bg-primary/95 text-primary-foreground text-xs">
      <div className="container mx-auto px-4 lg:px-8 h-8 flex items-center justify-end gap-2">
        <Globe className="h-3.5 w-3.5 opacity-80" aria-hidden />
        <span className="opacity-80 hidden sm:inline">{t("lang.label")}</span>
        <div className="flex items-center gap-1" role="group" aria-label="Language selection">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
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