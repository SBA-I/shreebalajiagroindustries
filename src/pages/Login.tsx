import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, Store, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-sbai.png";

type LoginRole = "dealer" | "admin" | null;

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Check role matches selection
    const userId = data.user?.id;
    if (!userId) { setLoading(false); return; }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const userRole = roleData?.role;

    if (selectedRole === "admin" && userRole !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("You don't have admin access.");
      return;
    }

    if (selectedRole === "dealer" && !["distributor", "dealer"].includes(userRole ?? "")) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("You don't have dealer/distributor access. Please contact admin.");
      return;
    }

    // Check approval for dealers/distributors
    if (["distributor", "dealer"].includes(userRole ?? "")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile?.is_approved) {
        await supabase.auth.signOut();
        setLoading(false);
        toast.error("Your account is pending approval. Please contact admin.");
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome back!");

    if (from) {
      navigate(from, { replace: true });
    } else if (userRole === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/distributor", { replace: true });
    }
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <img src={logoImg} alt="Shree Balaji Agro Industries" className="h-24 w-24 mx-auto mb-6 object-contain" />
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Shree Balaji Agro Industries</h1>
          <p className="text-muted-foreground mb-10">Select your login type to continue</p>

          <div className="grid gap-4 max-w-sm mx-auto">
            <button
              onClick={() => setSelectedRole("dealer")}
              className="group flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Dealer / Distributor</p>
                <p className="text-sm text-muted-foreground">Manage orders, inventory & pricing</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("admin")}
              className="group flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Company Admin</p>
                <p className="text-sm text-muted-foreground">Full control panel & analytics</p>
              </div>
            </button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Are you a farmer?{" "}
            <Link to="/products" className="text-primary font-medium hover:underline">Browse our products</Link>
          </p>

          <p className="mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    );
  }

  const roleLabel = selectedRole === "admin" ? "Admin" : "Dealer / Distributor";
  const RoleIcon = selectedRole === "admin" ? ShieldCheck : Store;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        <div className="relative z-10 px-12 text-primary-foreground">
          <img src={logoImg} alt="SBAI" className="h-20 w-20 mb-6 object-contain" />
          <h1 className="font-heading text-4xl font-bold mb-4">{roleLabel} Portal</h1>
          <p className="text-lg opacity-90 max-w-md">
            {selectedRole === "admin"
              ? "Manage products, dealers, orders, and analytics from your central dashboard."
              : "Access wholesale pricing, place bulk orders, and manage your inventory."}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Change login type
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RoleIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">{roleLabel} Sign In</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          {selectedRole === "dealer" && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) toast.error("Google sign-in failed");
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Register as Dealer
                </Link>
              </p>
            </>
          )}

          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
