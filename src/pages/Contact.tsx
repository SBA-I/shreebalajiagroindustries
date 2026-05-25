import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, Send, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { faqs } from "@/data/content";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";

const Contact = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "general", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        inquiry_type: form.type,
        message: form.message,
      });
      if (error) throw error;
      toast.success(t("contact.thanks"));
      setForm({ name: "", email: "", phone: "", type: "general", message: "" });
    } catch {
      toast.error(t("contact.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{t("contact.title")}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">{t("contact.subtitle")}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">{t("contact.getInTouch")}</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: t("contact.regOffice"), value: "2404/B1, Lane No. 6, Dhule-424001 (M.S.)" },
                  { icon: MapPin, label: t("contact.factory"), value: "Plot No. E-35, M.I.D.C., Awdhan, Dhule-424311" },
                  { icon: Phone, label: t("contact.mobile"), value: "+91 77449 98998" },
                  { icon: Mail, label: t("contact.email"), value: "sbaindia44@gmail.com" },
                  { icon: Clock, label: t("contact.hours"), value: t("contact.hoursVal") },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-2">{t("contact.emergency")}</h3>
                <p className="text-sm text-muted-foreground mb-2">{t("contact.emergencyDesc")}</p>
                <p className="text-sm font-bold text-destructive">+91 98605 32515 (24/7 Helpline)</p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8 shadow-card space-y-5">
                <h3 className="font-heading text-lg font-semibold text-foreground">{t("contact.send")}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.name")}</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.email")} <span className="text-muted-foreground text-xs">(optional)</span></label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile number *</label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+\-\s]{7,20}"
                    placeholder="+91 ..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.inquiryType")}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="general">{t("contact.type.general")}</option>
                    <option value="product">{t("contact.type.product")}</option>
                    <option value="distribution">{t("contact.type.distribution")}</option>
                    <option value="support">{t("contact.type.support")}</option>
                    <option value="complaint">{t("contact.type.complaint")}</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("contact.message")}</label>
                  <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <Button type="submit" className="gap-2" disabled={submitting}>
                  {submitting ? t("contact.sending") : t("contact.sendMsg")} <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("contact.faq.eyebrow")}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">{t("contact.faq.title")}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
