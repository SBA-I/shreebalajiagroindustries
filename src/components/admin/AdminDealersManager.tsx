import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dealer {
  id: string; name: string; contact_person: string | null; phone: string;
  email: string | null; address_line: string; city: string; district: string | null;
  state: string; pincode: string;
}

const blank = { name: "", contact_person: "", phone: "", email: "", address_line: "", city: "", district: "", state: "Maharashtra", pincode: "" };

const AdminDealersManager = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("dealers").select("*").order("city");
    setDealers((data ?? []) as Dealer[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address_line || !form.city || !form.state || !/^\d{6}$/.test(form.pincode)) {
      return toast.error("Fill all required fields incl. valid 6-digit pincode");
    }
    setBusy(true);
    const { error } = await supabase.from("dealers").insert({
      ...form,
      contact_person: form.contact_person || null,
      email: form.email || null,
      district: form.district || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Dealer added");
    setForm(blank);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this dealer?")) return;
    await supabase.from("dealers").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add dealer</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Contact person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
            <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Address *</Label><Input value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} /></div>
            <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
            <div><Label>State *</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            <div><Label>Pincode *</Label><Input value={form.pincode} maxLength={6} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} /></div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Dealer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Dealers ({dealers.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {dealers.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.city}, {d.state} – {d.pincode} · {d.phone}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDealersManager;