import { Award, Users, Package, Sprout } from "lucide-react";

const stats = [
  { icon: Award, value: "15+", label: "Years Experience", color: "text-primary" },
  { icon: Package, value: "10+", label: "Products", color: "text-secondary" },
  { icon: Users, value: "50+", label: "Distributors", color: "text-primary" },
  { icon: Sprout, value: "1000+", label: "Farmers", color: "text-secondary" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-accent" />
              <p className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-primary-foreground/75">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
