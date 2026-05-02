import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n/translations";

const Footer = () => {
  const { t } = useI18n();
  const quickLinks: { tKey: TKey; path: string }[] = [
    { tKey: "nav.about", path: "/about" },
    { tKey: "nav.products", path: "/products" },
    { tKey: "nav.resources", path: "/resources" },
    { tKey: "footer.newsUpdates", path: "/news" },
    { tKey: "footer.contactUs", path: "/contact" },
  ];
  const productLinks: { tKey: TKey; slug: string }[] = [
    { tKey: "cat.insecticides", slug: "insecticides" },
    { tKey: "cat.fungicides", slug: "fungicides" },
    { tKey: "cat.herbicides", slug: "herbicides" },
    { tKey: "cat.pgr", slug: "pgr" },
  ];
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Shree Balaji Agro Industries</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.tKey}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {t(link.tKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t("footer.products")}</h4>
            <ul className="space-y-2">
              {productLinks.map((p) => (
                <li key={p.slug}>
                  <Link to={`/products?category=${p.slug}`} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {t(p.tKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t("footer.contactUs")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>Regd. Off.: 2404/B1, Lane No. 6, Dhule-424001 (M.S.)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>+91 77449 98998</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>sbaindia44@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Shree Balaji Agro Industries. {t("footer.rights")}
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terms" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
