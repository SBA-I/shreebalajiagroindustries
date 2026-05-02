import { Shield, Droplets, Bug, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n/translations";

type Item = { icon: typeof Bug; titleKey: TKey; descKey: TKey; link: string };

const items: Item[] = [
  { icon: Bug, titleKey: "fp.insecticides.title", descKey: "fp.insecticides.desc", link: "/products?category=insecticides" },
  { icon: Shield, titleKey: "fp.fungicides.title", descKey: "fp.fungicides.desc", link: "/products?category=fungicides" },
  { icon: Droplets, titleKey: "fp.herbicides.title", descKey: "fp.herbicides.desc", link: "/products?category=herbicides" },
  { icon: Sprout, titleKey: "fp.pgr.title", descKey: "fp.pgr.desc", link: "/products?category=pgr" },
];

const FeaturedProducts = () => {
  const { t } = useI18n();
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("fp.eyebrow")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("fp.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("fp.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p, idx) => (
            <Link
              key={p.titleKey}
              to={p.link}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <p.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{t(p.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
