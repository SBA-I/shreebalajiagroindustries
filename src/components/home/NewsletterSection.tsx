import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: value, source: "homepage", is_active: true }, { onConflict: "email" });
    setBusy(false);
    if (error) {
      toast.error("Could not subscribe. Please try again.");
      return;
    }
    toast.success(t("news.thanks"));
    setEmail("");
  };

  return (
    <section
      className="py-16"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--forest)) 0%, hsl(120 45% 22%) 100%)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          {t("news.title")}
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          {t("news.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={t("news.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
            required
          />
          <Button type="submit" variant="hero" className="gap-2 shrink-0" disabled={busy}>
            {t("news.cta")}
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
