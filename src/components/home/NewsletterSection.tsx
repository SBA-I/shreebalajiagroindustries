import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // Normalize to E.164 (default IN +91 if 10 digits)
    const e164 = rawPhone.length === 10 ? `+91${rawPhone}` : `+${rawPhone}`;
    const emailValue = email.trim().toLowerCase() || null;
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { phone: e164, email: emailValue, source: "homepage", is_active: true, whatsapp_opt_in: true },
        { onConflict: "phone" },
      );
    if (error) {
      setBusy(false);
      toast.error("Could not subscribe. Please try again.");
      return;
    }
    // Fire welcome WhatsApp (non-blocking)
    supabase.functions
      .invoke("whatsapp-welcome", { body: { phone: e164, email: emailValue } })
      .catch(() => {});
    setBusy(false);
    toast.success(t("news.thanks"));
    setPhone("");
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
          <Input
            type="tel"
            inputMode="tel"
            placeholder="WhatsApp number (e.g. 98765 43210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
            required
            aria-label="WhatsApp phone number"
          />
          <Input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
            aria-label="Email (optional)"
          />
          <Button type="submit" variant="hero" className="gap-2" disabled={busy}>
            {t("news.cta")}
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
          <p className="text-xs text-primary-foreground/70">
            We'll send updates on WhatsApp. Standard rates may apply.
          </p>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
