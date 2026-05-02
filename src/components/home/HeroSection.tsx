import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Mail } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";
import { useI18n } from "@/i18n/I18nProvider";

const HeroSection = () => {
  const { t } = useI18n();
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Lush agricultural farmland" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        {/* Extra 20% dark overlay for headline contrast */}
        <div className="absolute inset-0 bg-foreground/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5">
            <Leaf className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">{t("hero.badge")}</span>
          </div>

          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight"
            style={{ textShadow: "0 2px 12px hsl(120 30% 8% / 0.55)" }}
          >
            {t("hero.title1")}{" "}
            <span className="text-gradient-gold">{t("hero.title2")}</span>
          </h1>

          <p
            className="text-lg text-primary-foreground/90 leading-relaxed max-w-xl"
            style={{ textShadow: "0 1px 6px hsl(120 30% 8% / 0.5)" }}
          >
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/products">
              <Button variant="hero" size="lg" className="gap-2 text-base">
                {t("hero.cta.products")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg" className="gap-2 text-base">
                <Mail className="h-5 w-5" />
                {t("hero.cta.contact")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
