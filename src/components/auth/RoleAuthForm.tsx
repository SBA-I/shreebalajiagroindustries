import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { Loader2, ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, roleHomePath, type AppRole } from "@/hooks/use-auth";
import logo from "@/assets/logo-sbai.png";

export type RoleKey = "farmer" | "distributor" | "field_officer" | "admin";

export type ExtraFieldsData = Record<string, unknown>;

interface RoleAuthFormProps {
  role: RoleKey;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass?: string;
  allowSignup?: boolean;
  showGoogle?: boolean;
  extraPhone?: boolean;
  /** Optional render prop to inject role-specific signup fields. */
  renderExtraFields?: (props: {
    value: ExtraFieldsData;
    onChange: (next: ExtraFieldsData) => void;
  }) => React.ReactNode;
  /** Optional async validator for the extra fields. Return error string or null. */
  validateExtras?: (value: ExtraFieldsData) => string | null;
  /** Map extras into the metadata payload sent to Supabase. */
  extrasToMetadata?: (value: ExtraFieldsData) => Record<string, unknown>;
}

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Invalid phone").max(20).optional().or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

const RoleAuthForm = ({
  role,
  title,
  description,
  icon: Icon,
  accentClass = "text-primary",
  allowSignup = true,
  showGoogle = true,
  extraPhone = true,
  renderExtraFields,
  validateExtras,
  extrasToMetadata,
}: RoleAuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Enforce: each role must use its own portal/email.
      // If the logged-in user has no role for this portal, sign them out
      // and keep them on the sign-in page.
      const portalRoleMap: Record<RoleKey, AppRole[]> = {
        farmer: ["farmer"],
        distributor: ["distributor"],
        field_officer: ["field_officer"],
        admin: ["admin"],
      } as const as any;
      const required = portalRoleMap[role];
      const hasRequired = roles.some((r) => required.includes(r));

      // Wait for roles to load (roles array is empty until DB lookup completes).
      // We only act once we either have roles or have confirmed the user has none.
      if (!hasRequired && roles.length > 0) {
        // Wrong portal for this account — sign out and stay on sign-in page.
        toast.error(
          `This account is not registered as a ${role.replace("_", " ")}. Please use the correct portal or sign up first.`,
        );
        supabase.auth.signOut();
        return;
      }
      if (hasRequired) {
        const redirectTo = (location.state as any)?.from ?? roleHomePath(roles);
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, roles, loading, navigate, location.state]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [extras, setExtras] = useState<ExtraFieldsData>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.toLowerCase().includes("invalid") ? "Invalid email or password" : error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      toast.error("Admin accounts are provisioned manually.");
      return;
    }
    const parsed = signupSchema.safeParse({ fullName: name, email, phone, password });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (validateExtras) {
      const err = validateExtras(extras);
      if (err) return toast.error(err);
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
          requested_role: role,
          ...(extrasToMetadata ? extrasToMetadata(extras) : {}),
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
    // Force the user back to the sign-in screen after signup, regardless of
    // whether Supabase auto-confirmed the email. This guarantees a clean
    // login step for new accounts.
    await supabase.auth.signOut();
    toast.success("Account created! Please sign in to continue.");
    setTab("login");
    setLoginEmail(parsed.data.email);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setExtras({});
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showSignup = allowSignup && role !== "admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center gap-2 mb-4">
          <img src={logo} alt="Shree Balaji Agro Industries" className="h-14 w-14 object-contain" />
          <h1 className="font-heading text-lg font-bold text-primary">Shree Balaji Agro</h1>
        </Link>

        <Link
          to="/auth"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="h-3 w-3" /> Choose another role
        </Link>

        <Card className="shadow-elevated">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Icon className={`h-5 w-5 ${accentClass}`} />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {showSignup ? (
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <LoginFormFields
                    email={loginEmail}
                    password={loginPassword}
                    setEmail={setLoginEmail}
                    setPassword={setLoginPassword}
                    onSubmit={handleLogin}
                    busy={busy}
                    showGoogle={showGoogle}
                    onGoogle={handleGoogle}
                  />
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    {extraPhone && (
                      <div>
                        <Label htmlFor="signup-phone">Mobile (optional)</Label>
                        <Input id="signup-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                      </div>
                    )}
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
                    {renderExtraFields?.({ value: extras, onChange: setExtras })}
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <LoginFormFields
                email={loginEmail}
                password={loginPassword}
                setEmail={setLoginEmail}
                setPassword={setLoginPassword}
                onSubmit={handleLogin}
                busy={busy}
                showGoogle={showGoogle && role !== "admin"}
                onGoogle={handleGoogle}
              />
            )}

            {role === "admin" && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Admin accounts are provisioned manually. Contact the office to request access.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface LoginFieldsProps {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
}

const LoginFormFields = ({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  busy,
  showGoogle,
  onGoogle,
}: LoginFieldsProps & { showGoogle?: boolean; onGoogle?: () => void }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <Label htmlFor="login-email">Email</Label>
      <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
    </div>
    <div>
      <Label htmlFor="login-password">Password</Label>
      <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    </div>
    <Button type="submit" className="w-full" disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
    </Button>
    {showGoogle && (
      <>
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Button type="button" variant="outline" className="w-full gap-2" onClick={onGoogle} disabled={busy}>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </>
    )}
  </form>
);

export default RoleAuthForm;