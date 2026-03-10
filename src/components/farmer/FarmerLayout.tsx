import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sprout, ShoppingBag, MapPin, MessageSquare, FileText, User, LogOut, Menu, X, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-sbai.png";

const sidebarItems = [
  { label: "Home", icon: Home, path: "/farmer" },
  { label: "Products", icon: ShoppingBag, path: "/farmer/products" },
  { label: "Recommendations", icon: Sprout, path: "/farmer/recommendations" },
  { label: "Find Dealer", icon: MapPin, path: "/farmer/dealers" },
  { label: "Ask Question", icon: MessageSquare, path: "/farmer/questions" },
  { label: "Guides", icon: FileText, path: "/farmer/guides" },
  { label: "My Profile", icon: User, path: "/farmer/profile" },
];

const FarmerLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {sidebarItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${active ? "bg-green-700 text-white" : "text-foreground/80 hover:bg-muted"}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={logoImg} alt="SBAI" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-heading text-sm font-bold text-green-700 leading-tight">Farmer Portal</p>
            <p className="text-xs text-muted-foreground">Shree Balaji Agro</p>
          </div>
        </div>
        {nav}
        <div className="mt-auto p-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="SBAI" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-bold text-green-700">Farmer Portal</span>
          </div>
          <button onClick={() => setOpen(!open)} className="p-2">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile sidebar overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
            <div className="w-64 bg-card h-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-border">
                <p className="font-heading font-bold text-green-700">Menu</p>
              </div>
              {nav}
              <div className="p-4 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout;
