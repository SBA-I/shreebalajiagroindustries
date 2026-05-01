import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Row { id: string; tracking_number: string; dealer_name: string; destination_city: string; destination_state: string; status: string; }
const STATUSES = ["preparing", "dispatched", "in_transit", "out_for_delivery", "delivered", "cancelled"];
const blank = { tracking_number: "", dealer_name: "", destination_city: "", destination_state: "Maharashtra", status: "preparing", carrier: "", expected_delivery_at: "" };

const AdminDispatchManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("dispatches").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tracking_number || !form.dealer_name || !form.destination_city) return toast.error("Fill required fields");
    setBusy(true);
    const { error } = await supabase.from("dispatches").insert({
      ...form,
      carrier: form.carrier || null,
      expected_delivery_at: form.expected_delivery_at || null,
      dispatched_at: form.status === "preparing" ? null : new Date().toISOString(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Dispatch added");
    setForm(blank);
    refresh();
  };

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "delivered") patch.delivered_at = new Date().toISOString();
    await supabase.from("dispatches").update(patch).eq("id", id);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this dispatch?")) return;
    await supabase.from("dispatches").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Create dispatch</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div><Label>Tracking # *</Label><Input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value.toUpperCase() })} placeholder="SBA-2026-0002" /></div>
            <div><Label>Dealer name *</Label><Input value={form.dealer_name} onChange={(e) => setForm({ ...form, dealer_name: e.target.value })} /></div>
            <div><Label>Carrier</Label><Input value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} /></div>
            <div><Label>City *</Label><Input value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} /></div>
            <div><Label>State</Label><Input value={form.destination_state} onChange={(e) => setForm({ ...form, destination_state: e.target.value })} /></div>
            <div><Label>Expected delivery</Label><Input type="date" value={form.expected_delivery_at} onChange={(e) => setForm({ ...form, expected_delivery_at: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Dispatches ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono">{r.tracking_number}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.dealer_name} → {r.destination_city}, {r.destination_state}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDispatchManager;