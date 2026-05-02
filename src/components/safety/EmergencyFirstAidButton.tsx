import { useEffect, useMemo, useRef, useState } from "react";
import { AlertOctagon, X, Mic, MicOff, Volume2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FIRST_AID, type ChemCategory, type ExposureType } from "@/data/firstAid";
import { Link } from "react-router-dom";

const CATEGORY_LABELS: { value: ChemCategory; label: string; emoji: string }[] = [
  { value: "insecticides", label: "Insecticide", emoji: "🐛" },
  { value: "fungicides", label: "Fungicide", emoji: "🍄" },
  { value: "herbicides", label: "Herbicide", emoji: "🌾" },
  { value: "pgr", label: "PGR", emoji: "🌱" },
];

const EXPOSURES: { value: ExposureType; label: string; emoji: string }[] = [
  { value: "skin", label: "Skin Contact", emoji: "🖐" },
  { value: "eye", label: "Eye Contact", emoji: "👁" },
  { value: "inhalation", label: "Inhalation", emoji: "🫁" },
  { value: "ingestion", label: "Swallowed", emoji: "👄" },
];

// Minimal speech-recognition typing
type SR = any;

const EmergencyFirstAidButton = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ChemCategory | null>(null);
  const [exposure, setExposure] = useState<ExposureType | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const recRef = useRef<SR | null>(null);

  const hasSpeech =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const protocol = useMemo(() => (category ? FIRST_AID[category] : null), [category]);
  const steps = useMemo(
    () => (protocol && exposure ? protocol.exposures[exposure] : []),
    [protocol, exposure]
  );

  // Voice intent parsing: very small keyword matcher.
  const parseVoice = (text: string) => {
    const t = text.toLowerCase();
    const cat: ChemCategory | null =
      /insect|bug|pest|killer|jaquar|phantom|terminator/.test(t) ? "insecticides"
      : /fungic|mould|mildew|blight/.test(t) ? "fungicides"
      : /herbic|weed/.test(t) ? "herbicides"
      : /pgr|growth|hormone/.test(t) ? "pgr"
      : null;
    const exp: ExposureType | null =
      /eye/.test(t) ? "eye"
      : /skin|hand|arm|face/.test(t) ? "skin"
      : /breath|inhal|smell|nose/.test(t) ? "inhalation"
      : /swallow|drink|drank|eat|mouth|ingest/.test(t) ? "ingestion"
      : null;
    if (cat) setCategory(cat);
    if (exp) setExposure(exp);
  };

  const startListening = () => {
    if (!hasSpeech) return;
    const SpeechRec: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(text);
      parseVoice(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recRef.current?.stop?.();
    setListening(false);
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !steps.length) return;
    window.speechSynthesis.cancel();
    const intro = `${protocol!.categoryLabel} exposure on ${exposure}. Follow these steps.`;
    const body = steps.map((s) => `Step ${s.step}. ${s.text}`).join(" ");
    const u = new SpeechSynthesisUtterance(`${intro} ${body}`);
    u.lang = "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => () => recRef.current?.stop?.(), []);

  const reset = () => {
    setCategory(null);
    setExposure(null);
    setTranscript("");
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Emergency First Aid"
        className="fixed bottom-[17.5rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elevated hover:scale-105 transition-transform animate-pulse"
      >
        {open ? <X className="h-6 w-6" /> : <AlertOctagon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-[21rem] sm:right-4 z-40 sm:w-[380px] flex items-stretch sm:items-end justify-center sm:justify-end p-2 sm:p-0">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 shadow-elevated border-destructive/30 animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-heading font-bold text-sm">Emergency First-Aid</h3>
                  <p className="text-[11px] text-muted-foreground">Works offline. Not a substitute for medical care.</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Voice helper */}
            <div className="mb-3 rounded-lg bg-destructive/5 border border-destructive/20 p-2.5">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={listening ? "destructive" : "outline"}
                  className="gap-1.5 h-8 text-xs"
                  onClick={listening ? stopListening : startListening}
                  disabled={!hasSpeech}
                >
                  {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {listening ? "Listening…" : "Voice help"}
                </Button>
                <p className="text-[11px] text-muted-foreground flex-1">
                  Say e.g. "eye contact with insecticide"
                </p>
              </div>
              {!hasSpeech && (
                <p className="text-[11px] text-muted-foreground mt-1.5">Voice not supported on this browser.</p>
              )}
              {transcript && (
                <p className="text-[11px] mt-1.5 italic text-foreground/70">"{transcript}"</p>
              )}
            </div>

            {/* Category step */}
            {!category && (
              <div>
                <p className="text-xs font-medium mb-2">1. Which product caused exposure?</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_LABELS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className="rounded-md border border-border p-2.5 text-left hover:border-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <div className="text-lg">{c.emoji}</div>
                      <div className="text-xs font-semibold">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exposure step */}
            {category && !exposure && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium">2. Type of exposure</p>
                  <button onClick={reset} className="text-[11px] text-primary underline">change</button>
                </div>
                <Badge variant="outline" className="mb-2 text-[10px]">{protocol!.categoryLabel}</Badge>
                <div className="grid grid-cols-2 gap-2">
                  {EXPOSURES.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => setExposure(e.value)}
                      className="rounded-md border border-border p-2.5 text-left hover:border-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <div className="text-lg">{e.emoji}</div>
                      <div className="text-xs font-semibold">{e.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            {category && exposure && protocol && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="destructive" className="text-[10px]">{protocol.categoryLabel}</Badge>
                    <Badge variant="outline" className="text-[10px]">{exposure}</Badge>
                    <Badge variant="outline" className="text-[10px]">PPE Class {protocol.ppeClass}</Badge>
                  </div>
                  <button onClick={reset} className="text-[11px] text-primary underline">restart</button>
                </div>

                <Button size="sm" variant="outline" onClick={speak} className="gap-1.5 h-8 text-xs mb-2 w-full">
                  <Volume2 className="h-3.5 w-3.5" /> Read steps aloud
                </Button>

                <ol className="space-y-2 mb-3">
                  {steps.map((s) => (
                    <li key={s.step} className="flex gap-2.5 text-xs">
                      <span className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        s.step === 99 ? "bg-destructive text-destructive-foreground" : "bg-destructive/10 text-destructive"
                      }`}>
                        {s.step === 99 ? "!" : s.step}
                      </span>
                      <span className="leading-snug pt-0.5">{s.text}</span>
                    </li>
                  ))}
                </ol>

                {protocol.doNot.length > 0 && (
                  <div className="rounded-md bg-destructive/5 border border-destructive/20 p-2.5 mb-2">
                    <p className="text-[11px] font-bold text-destructive mb-1">DO NOT</p>
                    <ul className="space-y-1">
                      {protocol.doNot.map((d) => (
                        <li key={d} className="text-[11px] text-foreground/80 flex gap-1.5">
                          <span className="text-destructive">✕</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {protocol.antidote && (
                  <p className="text-[11px] text-muted-foreground mb-2 italic">{protocol.antidote}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:1800118600">
                    <Button size="sm" variant="destructive" className="w-full gap-1.5 h-8 text-xs">
                      <Phone className="h-3.5 w-3.5" /> Poison 1800
                    </Button>
                  </a>
                  <a href="tel:108">
                    <Button size="sm" variant="outline" className="w-full gap-1.5 h-8 text-xs">
                      <Phone className="h-3.5 w-3.5" /> Ambulance 108
                    </Button>
                  </a>
                </div>

                <Link to="/safety" className="block text-center text-[11px] text-primary underline mt-2.5">
                  Open full Safety Hub →
                </Link>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default EmergencyFirstAidButton;