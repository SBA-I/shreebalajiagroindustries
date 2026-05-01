import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Minimal typings for the browser SpeechRecognition API
type SR = any;

const getRecognition = (): SR | null => {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
};

export type VoiceLang = "en-IN" | "hi-IN" | "mr-IN" | "gu-IN";

export const voiceLangLabels: Record<VoiceLang, string> = {
  "en-IN": "English",
  "hi-IN": "हिंदी",
  "mr-IN": "मराठी",
  "gu-IN": "ગુજરાતી",
};

interface Options {
  lang?: VoiceLang;
  onResult?: (transcript: string) => void;
}

export const useVoiceSearch = ({ lang = "en-IN", onResult }: Options = {}) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SR | null>(null);
  const supported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      try { recRef.current?.stop?.(); } catch { /* noop */ }
    };
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      toast.error("Voice search not supported on this browser");
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed") {
        toast.error("Microphone access denied");
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error("Voice error: " + e.error);
      }
    };
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      onResult?.(text);
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      // Already started
    }
  }, [lang, onResult, supported]);

  const stop = useCallback(() => {
    try { recRef.current?.stop?.(); } catch { /* noop */ }
    setListening(false);
  }, []);

  return { listening, transcript, supported, start, stop };
};