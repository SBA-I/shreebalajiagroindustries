import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVoiceSearch, voiceLangLabels, type VoiceLang } from "@/hooks/use-voice-search";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
}

const LANG_KEY = "sba.voice.lang";

const VoiceSearchButton = ({ onTranscript, className }: Props) => {
  const [lang, setLang] = useState<VoiceLang>(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(LANG_KEY)) as VoiceLang | null;
    return stored ?? "en-IN";
  });

  const { listening, supported, start, stop } = useVoiceSearch({
    lang,
    onResult: (text) => {
      if (text) {
        toast.success(`Heard: "${text}"`);
        onTranscript(text);
      }
    },
  });

  const setLangAndPersist = (l: VoiceLang) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* noop */ }
  };

  if (!supported) return null;

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <Button
        type="button"
        size="icon"
        variant={listening ? "default" : "outline"}
        onClick={() => (listening ? stop() : start())}
        aria-label={listening ? "Stop voice search" : "Start voice search"}
        className={listening ? "animate-pulse" : ""}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant="ghost" className="text-xs px-2 h-9">
            {voiceLangLabels[lang]}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="end">
          {(Object.keys(voiceLangLabels) as VoiceLang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLangAndPersist(l)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                lang === l ? "bg-primary/10 text-primary font-medium" : ""
              }`}
            >
              {voiceLangLabels[l]}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VoiceSearchButton;