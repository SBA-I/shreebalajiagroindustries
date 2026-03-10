import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Sprout, ArrowLeft, Calculator, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiChat } from "@/hooks/use-ai-chat";
import SprayCalculator from "@/components/ai/SprayCalculator";
import ReactMarkdown from "react-markdown";
import Layout from "@/components/layout/Layout";

const langLabels = { en: "English", hi: "हिंदी", mr: "मराठी" } as const;

const suggestedQuestions = [
  "Which pesticide should I use for whitefly on cotton?",
  "My tomato leaves have yellow spots. What disease is this?",
  "What is the dosage of fungicide for grapes?",
  "Safety precautions while spraying insecticides",
  "Best herbicide for weed control in soybean",
  "मेरे धान में कीड़े लग रहे हैं, क्या करूं?",
];

const AskAI = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearChat, language, setLanguage } = useAiChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Balaji AI Assistant 🌱</h1>
            <p className="text-sm text-muted-foreground">
              Ask about crops, pests, products, dosage & more
            </p>
          </div>
        </div>

        <Tabs defaultValue="chat">
          <TabsList className="mb-4">
            <TabsTrigger value="chat" className="gap-1.5">
              <Lightbulb className="h-4 w-4" /> AI Chat
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-1.5">
              <Calculator className="h-4 w-4" /> Spray Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="border border-border rounded-2xl bg-background overflow-hidden flex flex-col" style={{ height: "65vh" }}>
              {/* Language + Clear */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Language:</span>
                  {(Object.keys(langLabels) as Array<keyof typeof langLabels>).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        language === l
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {langLabels[l]}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sprout className="h-16 w-16 mx-auto mb-4 text-primary/30" />
                    <h3 className="font-heading font-bold text-lg mb-2">Ask Balaji AI anything!</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Get instant answers about crop diseases, pest control, product recommendations, dosage, and safety.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-left text-xs px-3 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
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
                      className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1">
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
                    <div className="bg-muted rounded-xl px-4 py-3 text-sm">
                      <span className="animate-pulse">🌱 Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-border">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about crops, pests, products, dosage..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="calculator">
            <div className="max-w-md mx-auto">
              <SprayCalculator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AskAI;
