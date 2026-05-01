import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, Loader2, Tractor, Briefcase, MapPin, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, roleHomePath } from "@/hooks/use-auth";
import logo from "@/assets/logo-sbai.png";

const roles = [
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

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Invalid phone").max(20).optional().or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(72),
  role: z.enum(["farmer", "distributor", "field_officer"]),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

const roleLabels: Record<"farmer" | "distributor" | "field_officer", string> = {
  farmer: "Farmer",
  distributor: "Distributor / Dealer",
  field_officer: "Field Officer",
};

const Auth = () => {
  const navigate = useNavigate();
  const { user, roles: userRoles, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(roleHomePath(userRoles), { replace: true });
    }
  }, [user, userRoles, loading, navigate]);

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
            {roles.map((r) => {
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

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "distributor" | "field_officer">("farmer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Welcome back!");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName: name, email, phone, password, role });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone || null,
          requested_role: parsed.data.role,
        },
      },
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        toast.error("This email is already registered. Please log in.");
        setTab("login");
        setLoginEmail(parsed.data.email);
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Account created! Check your email to verify, then log in.");
    setTab("login");
    setLoginEmail(parsed.data.email);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
    }
    // result.redirected handles the rest
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <img src={logo} alt="Shree Balaji Agro Industries" className="h-16 w-16 object-contain" />
          <h1 className="font-heading text-xl font-bold text-primary">Shree Balaji Agro</h1>
          <p className="text-xs text-muted-foreground">Agricultural Excellence</p>
        </Link>

        <Card className="shadow-elevated">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              Welcome
            </CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="signup-role">I am a</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as any)}>
                      <SelectTrigger id="signup-role"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(roleLabels) as Array<keyof typeof roleLabels>).map((r) => (
                          <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Mobile (optional)</Label>
                    <Input id="signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogle} disabled={busy}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our terms and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;