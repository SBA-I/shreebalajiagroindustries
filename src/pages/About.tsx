import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
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

const MD_MESSAGE =
  "Namaskar. I am Manoj Shankar Chaudhari, Managing Director of Shree Balaji Agro Industries. For over fifteen years, our mission has been simple: to stand beside the Indian farmer with honest, scientifically tested crop protection. Every bottle that leaves our Dhule facility carries our promise of quality, safety, and sustainability. Together, we are growing a stronger, greener tomorrow for Bharat.";

const milestoneIcons = [Sprout, FlaskConical, Handshake, Leaf];

const stats = [
  { icon: Calendar, value: 15, suffix: "+", label: "Years of Trust" },
  { icon: Sprout, value: 1000, suffix: "+", label: "Farmers Served" },
  { icon: Users, value: 50, suffix: "+", label: "Distributors" },
  { icon: Package, value: 10, suffix: "+", label: "Active Products" },
];

const StatItem = ({ icon: Icon, value, suffix, label }: typeof stats[number]) => {
  const [ref, current] = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="font-heading text-3xl md:text-4xl font-bold text-foreground tabular-nums">
        <span className="notranslate" translate="no">{current.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
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
      aria-label={speaking ? "Stop message" : "Play message from MD"}
    >
      {speaking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {speaking ? "Stop Message" : "Play Message from MD"}
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
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">About Us</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            A legacy of quality and trust in agricultural crop protection solutions.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 shadow-card">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide farmers and distributors with the highest quality crop protection products, backed by scientific research and dedicated customer support, ensuring food security and agricultural prosperity across India.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-8 shadow-card">
              <Award className="h-10 w-10 text-secondary mb-4" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted agrochemical brand, driving sustainable agriculture through innovation, quality, and an extensive distribution network reaching every farming community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats counter */}
      <section className="py-14 bg-card border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our Journey</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Company Milestones</h2>
          </div>
          <AnimatedTimeline />
        </div>
      </section>

      {/* Leadership / MD Profile */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Leadership</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Message from the Managing Director</h2>
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
          <h2 className="font-heading text-3xl font-bold text-foreground mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: "Quality", desc: "Rigorous quality control at every stage of manufacturing. ISO 9001:2015 certified processes." },
              { icon: Users, title: "Partnership", desc: "Building lasting relationships with 50+ distributors and thousands of farmers nationwide." },
              { icon: Award, title: "Innovation", desc: "Continuous R&D investment in advanced formulations and bio-pesticide development." },
              { icon: Target, title: "Integrity", desc: "Transparent business practices, ethical standards, and regulatory compliance at all times." },
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
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Our 2030 Sustainability Pledge
                </p>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  Less runoff. More yield. Better soil.
                </h3>
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
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Compliance & Recognition
            </p>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Certifications & Trust Bar
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Officially registered, audited, and licensed under Indian agro-chemical authorities.
            </p>
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
