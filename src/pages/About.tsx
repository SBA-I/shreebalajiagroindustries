import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { teamMembers, milestones } from "@/data/content";
import {
  Building2,
  Award,
  Target,
  Users,
  Leaf,
  ShieldCheck,
  BadgeCheck,
  Volume2,
  Square,
  Play,
  Sprout,
  Package,
  Calendar,
  FlaskConical,
  Handshake,
} from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n/translations";

const MD_MESSAGE =
  "Namaskar. I am Manoj Shankar Chaudhari, Managing Director of Shree Balaji Agro Industries. For over fifteen years, our mission has been simple: to stand beside the Indian farmer with honest, scientifically tested crop protection. Every bottle that leaves our Dhule facility carries our promise of quality, safety, and sustainability. Together, we are growing a stronger, greener tomorrow for Bharat.";

const milestoneIcons = [Sprout, FlaskConical, Handshake, Leaf];

const stats: { icon: typeof Calendar; value: number; suffix: string; labelKey: TKey }[] = [
  { icon: Calendar, value: 15, suffix: "+", labelKey: "about.stats.years" },
  { icon: Sprout, value: 1000, suffix: "+", labelKey: "about.stats.farmers" },
  { icon: Users, value: 50, suffix: "+", labelKey: "about.stats.distributors" },
  { icon: Package, value: 10, suffix: "+", labelKey: "about.stats.products" },
];

const StatItem = ({ icon: Icon, value, suffix, labelKey }: typeof stats[number]) => {
  const [ref, current] = useCountUp(value);
  const { t } = useI18n();
  return (
    <div ref={ref} className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="font-heading text-3xl md:text-4xl font-bold text-foreground tabular-nums">
        <span className="notranslate" translate="no">{current.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{t(labelKey)}</p>
    </div>
  );
};

const useInView = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
};

const MdVoicePlayer = () => {
  const [speaking, setSpeaking] = useState(false);
  const { t } = useI18n();

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(MD_MESSAGE);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.lang = "en-IN";
    const voices = synth.getVoices();
    const indian = voices.find((v) => /en[-_]IN/i.test(v.lang));
    if (indian) utter.voice = indian;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <button
      onClick={speak}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-card"
      aria-label={speaking ? t("about.md.stop") : t("about.md.play")}
    >
      {speaking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {speaking ? t("about.md.stop") : t("about.md.play")}
      <Volume2 className="h-4 w-4 opacity-80" />
    </button>
  );
};

const AnimatedTimeline = () => {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className="max-w-3xl mx-auto relative">
      {/* Timeline track */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px overflow-hidden">
        <div
          className="w-full bg-primary origin-top transition-transform duration-[1800ms] ease-out"
          style={{
            height: "100%",
            transform: inView ? "scaleY(1)" : "scaleY(0)",
          }}
        />
      </div>

      {milestones.map((m, i) => {
        const Icon = milestoneIcons[i % milestoneIcons.length];
        return (
          <div
            key={m.year}
            className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 600ms ease-out ${300 + i * 350}ms, transform 600ms ease-out ${300 + i * 350}ms`,
            }}
          >
            {/* Dot with icon */}
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 mt-1 z-10">
              <div className="w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-card">
                <Icon className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </div>
            <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {m.year}
              </span>
              <h3 className="font-heading font-semibold text-foreground mt-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
            </div>
            <div className="hidden md:block md:w-[calc(50%-2rem)]" />
          </div>
        );
      })}
    </div>
  );
};

const certifications = [
  { name: "ISO 9001:2015", issuer: "Quality Management", year: "2014" },
  { name: "Bio-Stimulant License", issuer: "Govt. of India", year: "2026" },
  { name: "GST Compliant", issuer: "Tax Authority", year: "Active" },
];

const About = () => {
  const { t } = useI18n();
  return (
    <Layout>
      <SEO
        title="About Us — Shree Balaji Agro Industries"
        description="Learn about Shree Balaji Agro Industries — 15+ years of trusted crop protection solutions from Dhule, Maharashtra. Leadership, milestones, and our commitment to Indian farmers."
        path="/about"
      />
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{t("about.title")}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">{t("about.subtitle")}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 shadow-card">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{t("about.mission")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("about.missionDesc")}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-8 shadow-card">
              <Award className="h-10 w-10 text-secondary mb-4" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{t("about.vision")}</h2>
              <p className="text-muted-foreground leading-relaxed">{t("about.visionDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats counter */}
      <section className="py-14 bg-card border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <StatItem key={s.labelKey} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("about.journey.eyebrow")}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">{t("about.journey.title")}</h2>
          </div>
          <AnimatedTimeline />
        </div>
      </section>

      {/* Leadership / MD Profile */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("about.leadership.eyebrow")}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">{t("about.leadership.title")}</h2>
          </div>
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="max-w-4xl mx-auto bg-card rounded-2xl border border-border shadow-elevated overflow-hidden grid md:grid-cols-[260px_1fr]"
            >
              {/* Portrait panel */}
              <div className="relative bg-gradient-to-br from-primary to-primary/70 p-8 flex flex-col items-center justify-center text-primary-foreground">
                <div className="w-32 h-32 rounded-full bg-primary-foreground/15 backdrop-blur-sm border-4 border-primary-foreground/30 flex items-center justify-center mb-4">
                  <span className="font-heading text-4xl font-bold">{member.initials}</span>
                </div>
                <BadgeCheck className="h-5 w-5 text-accent absolute top-4 right-4" />
              </div>
              {/* Content */}
              <div className="p-8">
                <h3 className="font-heading text-2xl font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mt-1">{member.role}</p>
                <p className="text-muted-foreground mt-4 leading-relaxed">{member.bio}</p>
                <blockquote className="border-l-4 border-primary/40 pl-4 mt-5 italic text-foreground/80 text-sm">
                  “{MD_MESSAGE.slice(0, 160)}…”
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-12">{t("about.values.title")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: t("about.values.quality"), desc: t("about.values.qualityDesc") },
              { icon: Users, title: t("about.values.partnership"), desc: t("about.values.partnershipDesc") },
              { icon: Award, title: t("about.values.innovation"), desc: t("about.values.innovationDesc") },
              { icon: Target, title: t("about.values.integrity"), desc: t("about.values.integrityDesc") },
            ].map((v) => (
              <div key={v.title} className="bg-card rounded-xl border border-border p-6 shadow-card">
                <v.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Sustainability statement */}
          <div className="max-w-3xl mx-auto mt-12 bg-card rounded-2xl border border-primary/20 shadow-card p-6 md:p-8 text-left">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t("about.pledge.eyebrow")}</p>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">{t("about.pledge.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By 2030, Shree Balaji aims to reduce chemical runoff by{" "}
                  <span className="font-semibold text-foreground">30%</span> through precision farming
                  education, biodegradable packaging, and pollinator-safe formulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications — Trust Bar */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("about.cert.eyebrow")}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">{t("about.cert.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">{t("about.cert.subtitle")}</p>
          </div>

          {/* Horizontal scrolling trust bar */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-4 min-w-max md:justify-center">
              {certifications.map((c) => (
                <div
                  key={c.name}
                  className="w-56 shrink-0 bg-card rounded-xl border border-border shadow-card p-5 flex flex-col items-center text-center hover:shadow-elevated hover:border-primary/40 transition-all"
                >
                  {/* Stylized shield badge */}
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-card">
                      <ShieldCheck className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <BadgeCheck className="h-5 w-5 text-accent absolute -top-1 -right-1 bg-card rounded-full" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-sm leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.issuer}</p>
                  <span className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Since {c.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
