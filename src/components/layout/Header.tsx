import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  {
    label: "Products",
    path: "/products",
    children: [
      { label: "Pesticides", path: "/products?category=pesticides" },
      { label: "Insecticides", path: "/products?category=insecticides" },
      { label: "Fungicides", path: "/products?category=fungicides" },
      { label: "Herbicides", path: "/products?category=herbicides" },
    ],
  },
  { label: "Resources", path: "/resources" },
  { label: "News", path: "/news" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const { user, signOut } = useAuth();

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
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setDropdownOpen(item.label)}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <Link
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1
                  ${isActive(item.path) ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}`}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3 w-3" />}
              </Link>
              {item.children && dropdownOpen === item.label && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-elevated py-2 min-w-[180px] animate-fade-in">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      {child.label}
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
              <Link to="/distributor">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Distributor Login
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
              <div key={item.label}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.path) ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary"}`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              {user ? (
                <div className="space-y-2">
                  <Link to="/distributor" onClick={() => setMobileOpen(false)}>
                    <Button variant="default" size="sm" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="default" size="sm" className="w-full gap-2">
                    <User className="h-4 w-4" />
                    Distributor Login
                  </Button>
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
