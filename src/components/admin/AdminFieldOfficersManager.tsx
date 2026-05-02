import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FieldOfficer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  employee_id: string | null;
  assigned_territory: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  verification_status: string;
  created_at: string;
}

const blank = {
  email: "", password: "", full_name: "", phone: "",
  employee_id: "", assigned_territory: "",
  state: "Maharashtra", district: "", taluka: "",
};

const AdminFieldOfficersManager = () => {
  const [items, setItems] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,user_id,full_name,phone,employee_id,assigned_territory,state,district,taluka,verification_status,created_at")
      .eq("requested_role", "field_officer")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as FieldOfficer[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name || !form.phone || !form.employee_id) {
      return toast.error("Email, password, name, phone & employee ID are required");
    }
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-field-officer", {
      body: form,
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      return toast.error((data as any)?.error ?? error?.message ?? "Failed to create field officer");
    }
    toast.success("Field officer added & approved");
    setForm(blank);
    refresh();
  };

  const remove = async (user_id: string) => {
    if (!confirm("Delete this field officer's account? This cannot be undone.")) return;
    const { error, data } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id },
    });
    if (error || (data as any)?.error) {
      return toast.error((data as any)?.error ?? error?.message ?? "Failed");
    }
    toast.success("Field officer removed");
    refresh();
  };

  const approved = items.filter((i) => i.verification_status === "approved");
  const pending = items.filter((i) => i.verification_status === "pending");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4 text-primary" /> Add field officer
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Create the account directly. They will be auto-approved and can sign in immediately with the email & password you set.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Login credentials
            </div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Temporary password *</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" /></div>
            <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" /></div>

            <div className="md:col-span-3 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t border-border pt-3">
              Officer details
            </div>
            <div><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Employee ID *</Label><Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g. SBA-FO-001" /></div>
            <div><Label>Assigned territory</Label><Input value={form.assigned_territory} onChange={(e) => setForm({ ...form, assigned_territory: e.target.value })} placeholder="e.g. North Maharashtra" /></div>
            <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
            <div><Label>Taluka</Label><Input value={form.taluka} onChange={(e) => setForm({ ...form, taluka: e.target.value })} /></div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Field Officer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field officers ({items.length})</CardTitle>
          {pending.length > 0 && (
            <p className="text-xs text-amber-700">
              {pending.length} pending application(s) — approve them in the Verification tab.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : approved.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No approved field officers yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {approved.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {f.full_name ?? "—"} <span className="text-xs text-muted-foreground font-normal">· {f.employee_id ?? "no ID"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {f.phone ?? "—"} · {f.assigned_territory ?? f.district ?? f.state ?? "—"}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(f.user_id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFieldOfficersManager;