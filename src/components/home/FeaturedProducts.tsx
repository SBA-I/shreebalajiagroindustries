import { Shield, Droplets, Bug, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    icon: Bug,
    title: "Insecticides",
    description: "Advanced formulations to protect crops from destructive insect pests effectively.",
    link: "/products?category=insecticides",
  },
  {
    icon: Shield,
    title: "Fungicides",
    description: "Powerful solutions to prevent and control fungal diseases in all crop types.",
    link: "/products?category=fungicides",
  },
  {
    icon: Droplets,
    title: "Herbicides",
    description: "Targeted weed management solutions for cleaner, healthier crop fields.",
    link: "/products?category=herbicides",
  },
  {
    icon: Sprout,
    title: "Plant Growth Regulators",
    description: "Boost crop yield and quality with scientifically formulated growth enhancers.",
    link: "/products?category=pgr",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our Product Range</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Crop Protection
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Discover our wide range of agricultural solutions designed to protect and enhance your farming operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <Link
              key={product.title}
              to={product.link}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <product.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{product.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
