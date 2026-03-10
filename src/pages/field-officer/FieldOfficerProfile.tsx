import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const FieldOfficerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    territory: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, territory, city, state")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          territory: data.territory ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        territory: form.territory,
        city: form.city,
        state: form.state,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  if (loading) {
    return (
      <FieldOfficerLayout>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </FieldOfficerLayout>
    );
  }

  return (
    <FieldOfficerLayout>
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={form.email} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Territory / Area</label>
                <Input value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">City</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">State</label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FieldOfficerLayout>
  );
};

export default FieldOfficerProfile;
