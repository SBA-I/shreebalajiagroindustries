import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Shree Balaji Agro Industries</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Your trusted partner for premium crop protection solutions. Serving farmers and distributors with quality pesticides and insecticides since establishment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", path: "/about" },
                { label: "Products", path: "/products" },
                { label: "Resources", path: "/resources" },
                { label: "News & Updates", path: "/news" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">Products</h4>
            <ul className="space-y-2">
              {["Pesticides", "Insecticides", "Fungicides", "Herbicides"].map((p) => (
                <li key={p}>
                  <Link to={`/products?category=${p.toLowerCase()}`} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-accent">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>Industrial Area, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>info@shreebalajiagro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Shree Balaji Agro Industries. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
