import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-sbai.png";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/I18nProvider";
import type { TKey } from "@/i18n/translations";

type NavChild = { key: string; tKey: TKey; path: string };
type NavItem = { key: string; tKey: TKey; path: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { key: "home", tKey: "nav.home", path: "/" },
  { key: "about", tKey: "nav.about", path: "/about" },
  {
    key: "products",
    tKey: "nav.products",
    path: "/products",
    children: [
      { key: "insecticides", tKey: "cat.insecticides", path: "/products?category=insecticides" },
      { key: "fungicides", tKey: "cat.fungicides", path: "/products?category=fungicides" },
      { key: "herbicides", tKey: "cat.herbicides", path: "/products?category=herbicides" },
      { key: "pgr", tKey: "cat.pgr", path: "/products?category=pgr" },
    ],
  },
  {
    key: "dealers",
    tKey: "nav.dealers",
    path: "/dealers",
    children: [
      { key: "find", tKey: "dealers.find", path: "/dealers" },
      { key: "track", tKey: "dealers.track", path: "/track" },
      { key: "kit", tKey: "dealers.kit", path: "/marketing-kit" },
    ],
  },
  { key: "safety", tKey: "nav.safety", path: "/safety" },
  { key: "sustainability", tKey: "nav.sustainability", path: "/sustainability" },
  { key: "resources", tKey: "nav.resources", path: "/resources" },
  { key: "news", tKey: "nav.news", path: "/news" },
  { key: "contact", tKey: "nav.contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useI18n();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Shree Balaji Agro Industries" className="h-10 w-10 object-contain" />
          <div className="hidden sm:block">
            <p className="font-heading text-sm font-bold text-primary leading-tight">Shree Balaji</p>
            <p className="font-heading text-xs text-muted-foreground leading-tight">Agro Industries</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => item.children && setDropdownOpen(item.key)}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <Link
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1
                  ${isActive(item.path) ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}`}
              >
                {t(item.tKey)}
                {item.children && <ChevronDown className="h-3 w-3" />}
              </Link>
              {item.children && dropdownOpen === item.key && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-elevated py-2 min-w-[180px] animate-fade-in">
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      to={child.path}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      {t(child.tKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-1.5">
                <LogIn className="h-4 w-4" /> {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.key}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.path) ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary"}`}
                >
                  {t(item.tKey)}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t(child.tKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm font-medium text-primary"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={async () => { await signOut(); setMobileOpen(false); navigate("/"); }}
                    className="block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:text-primary"
                  >
                    {t("nav.signOut")}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm font-medium text-primary"
                >
                  {t("nav.loginSignup")}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
