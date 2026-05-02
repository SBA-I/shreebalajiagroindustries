import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2, Sprout, Mail, Mic, MicOff } from "lucide-react";
import whatsappIcon from "@/assets/whatsapp-icon.svg";
import { Button } from "@/components/ui/button";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useVoiceSearch, type VoiceLang } from "@/hooks/use-voice-search";
import ReactMarkdown from "react-markdown";

const langLabels = { en: "EN", hi: "हिं", mr: "मर" } as const;
const langToVoice: Record<keyof typeof langLabels, VoiceLang> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

interface AiChatWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const AiChatWidget = ({ open: openProp, onOpenChange, hideTrigger }: AiChatWidgetProps = {}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setOpenState(v);
  };
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearChat, language, setLanguage } = useAiChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { listening, supported: voiceSupported, start: startVoice, stop: stopVoice } = useVoiceSearch({
    lang: langToVoice[language as keyof typeof langLabels] ?? "en-IN",
    onResult: (text) => {
      if (text) setInput((prev) => (prev ? prev + " " + text : text));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      {!hideTrigger && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-3 z-50 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-3 z-50 w-[380px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              <span className="font-heading font-bold text-sm">Balaji AI 🌱</span>
            </div>
            <div className="flex items-center gap-1">
              {(Object.keys(langLabels) as Array<keyof typeof langLabels>).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`text-xs px-2 py-0.5 rounded ${language === l ? "bg-primary-foreground/20 font-bold" : "opacity-70 hover:opacity-100"}`}
                >
                  {langLabels[l]}
                </button>
              ))}
              <button onClick={clearChat} className="ml-2 opacity-70 hover:opacity-100" title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="ml-1 opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Sprout className="h-10 w-10 mx-auto mb-3 text-primary opacity-50" />
                <p className="font-medium">How can I help you today?</p>
                <p className="text-xs mt-1">
                  Ask about crops, pests, products, dosage...
                </p>
                <div className="mt-4 space-y-1.5">
                  {[
                    "Which pesticide for whitefly on cotton?",
                    "Dosage of fungicide for tomato",
                    "मेरे धान में कीड़े लग रहे हैं",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-2 text-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 border-t border-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Ask about crops, pests, products..."}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <Button
              type="button"
              size="icon"
              variant={listening ? "default" : "outline"}
              onClick={() => {
                if (!voiceSupported) {
                  alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
                  return;
                }
                listening ? stopVoice() : startVoice();
              }}
              className={`h-9 w-9 shrink-0 ${listening ? "animate-pulse" : ""} ${!voiceSupported ? "opacity-50" : ""}`}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              title={!voiceSupported ? "Voice not supported in this browser" : listening ? "Stop" : "Speak your question"}
              disabled={isLoading}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" variant="default" disabled={!input.trim() || isLoading} className="h-9 w-9 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
