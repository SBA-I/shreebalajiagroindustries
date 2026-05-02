import { Award, Users, Package, Sprout, LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";

const stats: { icon: LucideIcon; value: number; suffix: string; label: string }[] = [
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  { icon: Package, value: 10, suffix: "+", label: "Products" },
  { icon: Users, value: 50, suffix: "+", label: "Distributors" },
  { icon: Sprout, value: 1000, suffix: "+", label: "Farmers" },
];

const StatItem = ({ icon: Icon, value, suffix, label }: typeof stats[number]) => {
  const [ref, current] = useCountUp(value);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <Icon className="h-8 w-8 mx-auto mb-3 text-accent" />
      <p className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-1 tabular-nums">
        <span className="notranslate" translate="no">{current.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="text-sm text-primary-foreground/75">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
