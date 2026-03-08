import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Lush agricultural farmland" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5">
            <Leaf className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">Trusted Crop Protection Solutions</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
            Empowering Agriculture,{" "}
            <span className="text-gradient-gold">Enriching Lives</span>
          </h1>

          <p className="text-lg text-primary-foreground/85 leading-relaxed max-w-xl">
            Premium quality pesticides and insecticides engineered for modern farming. 
            Protecting your crops, maximizing your harvest.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/products">
              <Button variant="hero" size="lg" className="gap-2 text-base">
                Explore Products
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg" className="text-base">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
