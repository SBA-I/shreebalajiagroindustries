import { Award, Users, Package, Sprout, LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n/translations";

const stats: { icon: LucideIcon; value: number; suffix: string; labelKey: TKey }[] = [
  { icon: Award, value: 15, suffix: "+", labelKey: "stats.years" },
  { icon: Package, value: 10, suffix: "+", labelKey: "stats.products" },
  { icon: Users, value: 50, suffix: "+", labelKey: "stats.distributors" },
  { icon: Sprout, value: 1000, suffix: "+", labelKey: "stats.farmers" },
];

const StatItem = ({ icon: Icon, value, suffix, labelKey }: typeof stats[number]) => {
  const [ref, current] = useCountUp(value);
  const { t } = useI18n();
  return (
    <div ref={ref} className="text-center">
      <Icon className="h-8 w-8 mx-auto mb-3 text-accent" />
      <p className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-1 tabular-nums">
        <span className="notranslate" translate="no">{current.toLocaleString()}</span>
        {suffix}
      </p>
      <p className="text-sm text-primary-foreground/75">{t(labelKey)}</p>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.labelKey} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
