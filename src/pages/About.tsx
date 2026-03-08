import Layout from "@/components/layout/Layout";
import { teamMembers, milestones } from "@/data/content";
import { Building2, Award, Target, Users, ChevronRight } from "lucide-react";

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

      {/* Timeline */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our Journey</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Company Milestones</h2>
          </div>
          <div className="max-w-3xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />
            {milestones.map((m, i) => (
              <div key={m.year} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card -translate-x-1.5 md:-translate-x-1.5 mt-1.5 z-10" />
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <span className="text-sm font-bold text-primary">{m.year}</span>
                  <h3 className="font-heading font-semibold text-foreground mt-1">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                </div>
                {/* Spacer for alternating side */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Leadership</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-card rounded-xl border border-border p-6 shadow-card text-center group hover:shadow-elevated transition-all">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="font-heading text-xl font-bold text-primary">{member.initials}</span>
                </div>
                <h3 className="font-heading font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: "Quality", desc: "Rigorous quality control at every stage of manufacturing. ISO 9001:2015 certified processes." },
              { icon: Users, title: "Partnership", desc: "Building lasting relationships with 500+ distributors and thousands of farmers nationwide." },
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
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">Certifications & Recognition</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              "ISO 9001:2015 Certified",
              "CIB&RC Registered",
              "GMP Compliant Facility",
              "AgriExpo 2025 Quality Award",
            ].map((cert) => (
              <div key={cert} className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-3">
                <Award className="h-6 w-6 text-accent shrink-0" />
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
