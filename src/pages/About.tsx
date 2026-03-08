import Layout from "@/components/layout/Layout";
import { Building2, Users, Award, Target } from "lucide-react";

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
                To provide farmers and distributors with the highest quality crop protection products, backed by scientific research and dedicated customer support, ensuring food security and agricultural prosperity.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-8 shadow-card">
              <Award className="h-10 w-10 text-secondary mb-4" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted agrochemical brand, driving sustainable agriculture through innovation, quality, and an extensive distribution network across the nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Building2, title: "Quality", desc: "Rigorous quality control at every stage of manufacturing" },
              { icon: Users, title: "Partnership", desc: "Building lasting relationships with distributors and farmers" },
              { icon: Award, title: "Innovation", desc: "Continuous R&D for advanced crop protection solutions" },
              { icon: Target, title: "Integrity", desc: "Transparent business practices and ethical standards" },
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
    </Layout>
  );
};

export default About;
