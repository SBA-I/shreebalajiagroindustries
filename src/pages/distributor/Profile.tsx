import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Building2, MapPin, Phone, Mail, Shield, Save, Loader2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "business" | "security">("personal");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", company_name: "", gst_number: "",
    address: "", city: "", state: "", pincode: "", territory: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["dist-profile-full", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        company_name: profile.company_name ?? "",
        gst_number: profile.gst_number ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        pincode: profile.pincode ?? "",
        territory: profile.territory ?? "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      company_name: form.company_name,
      gst_number: form.gst_number,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPw = formData.get("new_password") as string;
    const confirmPw = formData.get("confirm_password") as string;
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast.error(error.message);
    else toast.success("Password updated!");
  };

  const initials = (form.full_name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <DistributorLayout title="Profile" subtitle="Manage your account settings">
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Profile" subtitle="Manage your account settings">
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {[
          { id: "personal" as const, label: "Personal Info", icon: User },
          { id: "business" as const, label: "Business Details", icon: Building2 },
          { id: "security" as const, label: "Security", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "personal" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-heading text-xl font-bold text-primary">{initials}</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">{form.full_name || "—"}</p>
                <p className="text-sm text-muted-foreground">Distributor</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input value={form.email} disabled className="bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </Button>
        </div>
      )}

      {activeTab === "business" && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">GST Number</label>
              <Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">State</label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode</label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Assigned Territory</label>
              <Input value={form.territory} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Territory assignments are managed by admin.</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </Button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handlePasswordChange} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-heading font-semibold text-foreground">Change Password</h3>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
              <Input type="password" name="new_password" placeholder="••••••••" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm New Password</label>
              <Input type="password" name="confirm_password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="gap-2">
              <Shield className="h-4 w-4" /> Update Password
            </Button>
          </form>
        </div>
      )}
    </DistributorLayout>
  );
};

export default Profile;
