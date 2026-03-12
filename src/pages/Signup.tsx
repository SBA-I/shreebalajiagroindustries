import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Store } from "lucide-react";
import logoImg from "@/assets/logo-sbai.png";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (!state) { toast.error("Please select your state"); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName, phone },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) { setLoading(false); toast.error(error.message); return; }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").update({
        company_name: companyName || null,
        phone: phone || null,
        gst_number: gstNumber.trim().toUpperCase() || null,
        pan_number: panNumber.trim().toUpperCase() || null,
        license_number: licenseNumber.trim() || null,
        address: address.trim() || null,
        state: state || null,
        city: district.trim() || null,
        pincode: pincode.trim() || null,
      } as any).eq("user_id", userId);
    }

    setLoading(false);
    toast.success("Registration submitted! Your account will be activated after admin approval.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-primary" />
        <div className="relative z-10 px-12 text-secondary-foreground">
          <img src={logoImg} alt="SBAI" className="h-20 w-20 mb-6 object-contain" />
          <h1 className="font-heading text-4xl font-bold mb-4">Become a Dealer</h1>
          <p className="text-lg opacity-90 max-w-md">
            Register to access wholesale pricing, bulk orders, and dedicated support from Shree Balaji Agro Industries.
          </p>
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <p className="text-sm opacity-80">
              ⏳ After registration, your account will be reviewed and approved by our admin team within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <img src={logoImg} alt="SBAI" className="h-10 w-10 object-contain" />
            <span className="font-heading text-xl font-bold text-foreground">Shree Balaji Agro</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Dealer / Distributor Registration</h2>
              <p className="text-sm text-muted-foreground">Fill in your business details below</p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dealer Name *</label>
                <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Business / Firm Name *</label>
                <Input placeholder="Your firm name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number *</label>
                <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Business Details */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Business Details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">GST Number *</label>
                <Input placeholder="e.g. 27ABCDE1234F1ZK" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} required maxLength={15} className="uppercase" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">PAN Number (Optional)</label>
                <Input placeholder="e.g. ABCDE1234F" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} maxLength={10} className="uppercase" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">License Number (Optional)</label>
              <Input placeholder="Agrochemical license number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Shop / Office Address *</label>
              <Input placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">District *</label>
                <Input placeholder="e.g. Indore" value={district} onChange={(e) => setDistrict(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                <Input placeholder="e.g. 452001" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} required maxLength={6} inputMode="numeric" />
              </div>
            </div>

            {/* Login Details */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Login Credentials</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Registration
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (error) toast.error("Google sign-in failed");
          }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <p className="mt-6 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
            ⏳ After registration, your account will be reviewed and approved by our team within 24-48 hours.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}<Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>

          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
