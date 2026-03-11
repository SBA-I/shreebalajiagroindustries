import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Sprout, ArrowLeft, Phone } from "lucide-react";
import logoImg from "@/assets/logo-sbai.png";

const FARMER_EMAIL_DOMAIN = "farmer.sbai.local";

const FarmerLogin = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pseudoEmail = (ph: string) => `${ph.replace(/\D/g, "")}@${FARMER_EMAIL_DOMAIN}`;
  const paddedPin = (p: string) => `sbai${p}00`; // pad 4-digit PIN to 8 chars for Supabase

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pseudoEmail(cleanPhone),
      password: paddedPin(pin),
    });

    if (error) {
      setLoading(false);
      toast.error("Invalid mobile number or PIN. Please try again.");
      return;
    }

    const userId = data.user?.id;
    if (!userId) { setLoading(false); return; }

    // Verify farmer role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData?.role !== "farmer") {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("This login is for farmers only. Please use the main login.");
      return;
    }

    setLoading(false);
    toast.success("Welcome! 🌾");
    navigate("/farmer", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("Please set a 4-digit PIN");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: pseudoEmail(cleanPhone),
      password: paddedPin(pin),
      options: {
        data: {
          full_name: name.trim(),
          phone: cleanPhone,
          village: village.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.includes("already registered")) {
        toast.error("This mobile number is already registered. Please login.");
        setMode("login");
      } else {
        toast.error(error.message);
      }
      return;
    }

    const userId = data.user?.id;
    if (!userId) { setLoading(false); return; }

    // Check if farmer role already exists (trigger assigns 'dealer' by default, but farmer emails are excluded)
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingRole) {
      // Assign farmer role
      await supabase.from("user_roles").insert({ user_id: userId, role: "farmer" as any });
    } else if (existingRole.role !== "farmer") {
      // Update to farmer role
      await supabase.from("user_roles").update({ role: "farmer" as any }).eq("user_id", userId);
    }

    // Update profile with phone & village
    await supabase
      .from("profiles")
      .update({ phone: cleanPhone, city: village.trim(), is_approved: true })
      .eq("user_id", userId);

    setLoading(false);
    toast.success("Account created! Welcome to Shree Balaji Agro 🌾");
    navigate("/farmer", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500">
        <div className="relative z-10 px-12 text-white">
          <img src={logoImg} alt="SBAI" className="h-20 w-20 mb-6 object-contain" />
          <h1 className="font-heading text-4xl font-bold mb-4">Farmer Portal</h1>
          <p className="text-lg opacity-90 max-w-md">
            Browse products, get crop-wise recommendations, dosage instructions, and locate your nearest dealer.
          </p>
          <div className="mt-8 space-y-3 text-sm opacity-80">
            <div className="flex items-center gap-2"><Sprout className="h-4 w-4" /> Crop-wise recommendations</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> Login with mobile number only</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Other login types
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {mode === "login" ? "Farmer Login" : "Farmer Registration"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Enter your mobile number & PIN" : "Create your account"}
              </p>
            </div>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name *</label>
                  <Input
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Village / City</label>
                  <Input
                    placeholder="e.g. Indore"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number *</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  maxLength={10}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {mode === "signup" ? "Set 4-Digit PIN *" : "4-Digit PIN *"}
              </label>
              <Input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                maxLength={4}
                inputMode="numeric"
                className="text-center text-xl tracking-[0.5em] max-w-[200px]"
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground mt-1">Remember this PIN to login later</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === "login" ? "Login" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New farmer?{" "}
                <button onClick={() => setMode("signup")} className="text-green-700 font-medium hover:underline">
                  Register here
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button onClick={() => setMode("login")} className="text-green-700 font-medium hover:underline">
                  Login
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerLogin;
