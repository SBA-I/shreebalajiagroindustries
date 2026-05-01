import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, Loader2, Tractor, Briefcase, MapPin, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, roleHomePath } from "@/hooks/use-auth";
import logo from "@/assets/logo-sbai.png";

const roleOptions = [
  {
    key: "farmer",
    label: "Farmer",
    description: "Browse products, get crop guidance & order from your dealer.",
    icon: Tractor,
    path: "/auth/farmer",
    accent: "bg-primary/10 text-primary",
  },
  {
    key: "distributor",
    label: "Distributor / Dealer",
    description: "B2B portal — place orders, manage inventory and invoices.",
    icon: Briefcase,
    path: "/auth/distributor",
    accent: "bg-secondary/40 text-secondary-foreground",
  },
  {
    key: "field_officer",
    label: "Field Officer",
    description: "Sales rep portal with GPS check-ins and target tracking.",
    icon: MapPin,
    path: "/auth/field-officer",
    accent: "bg-accent/20 text-accent-foreground",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Internal administration of users, products and orders.",
    icon: Shield,
    path: "/auth/admin",
    accent: "bg-muted text-foreground",
  },
];

const Auth = () => {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(roleHomePath(roles), { replace: true });
    }
  }, [user, roles, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <img src={logo} alt="Shree Balaji Agro Industries" className="h-16 w-16 object-contain" />
          <h1 className="font-heading text-xl font-bold text-primary">Shree Balaji Agro</h1>
          <p className="text-xs text-muted-foreground">Agricultural Excellence</p>
        </Link>

        <Card className="shadow-elevated">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading text-2xl flex items-center justify-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              Choose your account type
            </CardTitle>
            <CardDescription>Select the portal you want to sign in to or sign up for.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 pt-4">
            {roleOptions.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.key}
                  to={r.path}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary hover:shadow-card transition-all"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${r.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading font-semibold text-sm">{r.label}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;