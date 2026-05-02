import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Plus, Upload, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDialog from "./EditDialog";

interface Row {
  id: string; tracking_number: string; dealer_id: string | null; dealer_name: string;
  destination_city: string; destination_state: string; status: string; stage: string;
  lr_number: string | null; transport_company: string | null; carrier: string | null;
  driver_name: string | null; driver_phone: string | null;
  product_summary: string | null; quantity_summary: string | null;
  expected_delivery_at: string | null; challan_url: string | null; notes: string | null;
}

interface DealerLite { id: string; name: string; city: string; state: string; }

const STAGES = [
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "being_packed", label: "Being Packed" },
  { key: "dispatched", label: "Dispatched from Dhule" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "received", label: "Received" },
];

const blank = {
  tracking_number: "", dealer_id: "", dealer_name: "",
  destination_city: "", destination_state: "Maharashtra",
  stage: "order_confirmed",
  lr_number: "", transport_company: "", driver_name: "", driver_phone: "",
  product_summary: "", quantity_summary: "",
  expected_delivery_at: "", notes: "",
};

const AdminDispatchManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [dealers, setDealers] = useState<DealerLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [{ data }, { data: dlist }] = await Promise.all([
      supabase.from("dispatches").select("*").order("created_at", { ascending: false }),
      supabase.from("dealers").select("id,name,city,state").eq("is_active", true).order("name"),
    ]);
    setRows((data ?? []) as Row[]);
    setDealers((dlist ?? []) as DealerLite[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const stageToStatus = (stage: string) => {
    if (stage === "received") return "delivered";
    if (stage === "order_confirmed" || stage === "being_packed") return "preparing";
    if (stage === "dispatched") return "dispatched";
    return "in_transit";
  };

  const onPickDealer = (id: string) => {
    const d = dealers.find((x) => x.id === id);
    setForm({
      ...form,
      dealer_id: id,
      dealer_name: d?.name ?? form.dealer_name,
      destination_city: d?.city ?? form.destination_city,
      destination_state: d?.state ?? form.destination_state,
    });
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tracking_number || !form.dealer_name || !form.destination_city) return toast.error("Fill required fields");
    setBusy(true);
    const status = stageToStatus(form.stage);
    const { error } = await supabase.from("dispatches").insert({
      tracking_number: form.tracking_number,
      dealer_id: form.dealer_id || null,
      dealer_name: form.dealer_name,
      destination_city: form.destination_city,
      destination_state: form.destination_state,
      stage: form.stage,
      status,
      lr_number: form.lr_number || null,
      transport_company: form.transport_company || null,
      carrier: form.transport_company || null,
      driver_name: form.driver_name || null,
      driver_phone: form.driver_phone || null,
      product_summary: form.product_summary || null,
      quantity_summary: form.quantity_summary || null,
      expected_delivery_at: form.expected_delivery_at || null,
      notes: form.notes || null,
      dispatched_at: ["dispatched","in_transit","out_for_delivery","received"].includes(form.stage) ? new Date().toISOString() : null,
      delivered_at: form.stage === "received" ? new Date().toISOString() : null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Shipment created");
    setForm(blank);
    refresh();
  };

  const updateStage = async (id: string, stage: string) => {
    const status = stageToStatus(stage);
    const patch: any = { stage, status };
    if (stage === "received") patch.delivered_at = new Date().toISOString();
    if (["dispatched","in_transit","out_for_delivery","received"].includes(stage)) {
      patch.dispatched_at = patch.dispatched_at ?? new Date().toISOString();
    }
    const { error } = await supabase.from("dispatches").update(patch).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Stage updated");
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this shipment?")) return;
    await supabase.from("dispatches").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Create shipment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div><Label>Tracking # *</Label><Input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value.toUpperCase() })} placeholder="SBA-2026-0002" /></div>
            <div className="md:col-span-2">
              <Label>Dealer</Label>
              <Select value={form.dealer_id} onValueChange={onPickDealer}>
                <SelectTrigger><SelectValue placeholder="Pick dealer (auto-fills city)" /></SelectTrigger>
                <SelectContent>
                  {dealers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Dealer name *</Label><Input value={form.dealer_name} onChange={(e) => setForm({ ...form, dealer_name: e.target.value })} /></div>
            <div><Label>City *</Label><Input value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} /></div>
            <div><Label>State</Label><Input value={form.destination_state} onChange={(e) => setForm({ ...form, destination_state: e.target.value })} /></div>

            <div><Label>LR Number</Label><Input value={form.lr_number} onChange={(e) => setForm({ ...form, lr_number: e.target.value })} placeholder="LR123456" /></div>
            <div><Label>Transport company</Label><Input value={form.transport_company} onChange={(e) => setForm({ ...form, transport_company: e.target.value })} placeholder="VRL Logistics" /></div>
            <div><Label>Expected delivery</Label><Input type="date" value={form.expected_delivery_at} onChange={(e) => setForm({ ...form, expected_delivery_at: e.target.value })} /></div>

            <div><Label>Driver name</Label><Input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} /></div>
            <div><Label>Driver phone</Label><Input type="tel" value={form.driver_phone} onChange={(e) => setForm({ ...form, driver_phone: e.target.value })} placeholder="+91…" /></div>
            <div>
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2"><Label>Products summary</Label><Input value={form.product_summary} onChange={(e) => setForm({ ...form, product_summary: e.target.value })} placeholder="Jaquar, Phantom" /></div>
            <div><Label>Quantity</Label><Input value={form.quantity_summary} onChange={(e) => setForm({ ...form, quantity_summary: e.target.value })} placeholder="20 L + 10 kg" /></div>

            <div className="md:col-span-3"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Shipments ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono">{r.tracking_number} {r.lr_number && <span className="text-xs text-muted-foreground">· LR {r.lr_number}</span>}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.dealer_name} → {r.destination_city}, {r.destination_state}
                      {r.transport_company && ` · ${r.transport_company}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select value={r.stage ?? "order_confirmed"} onValueChange={(v) => updateStage(r.id, v)}>
                      <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <ChallanButton row={r} onSaved={refresh} />
                    <EditShipmentButton row={r} dealers={dealers} onSaved={refresh} />
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

const ChallanButton = ({ row, onSaved }: { row: Row; onSaved: () => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (f: File) => {
    setBusy(true);
    const path = `challans/${row.id}-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("dealer-invoices").upload(path, f, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    const { error: e2 } = await supabase.from("dispatches").update({ challan_url: path }).eq("id", row.id);
    setBusy(false);
    if (e2) return toast.error(e2.message);
    toast.success("Challan uploaded");
    onSaved();
  };
  return (
    <>
      <input ref={ref} type="file" accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); if (ref.current) ref.current.value = ""; }} />
      <Button size="icon" variant="ghost" disabled={busy} onClick={() => ref.current?.click()} title="Upload challan/LR PDF">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      </Button>
    </>
  );
};

const EditShipmentButton = ({ row, dealers, onSaved }: { row: Row; dealers: DealerLite[]; onSaved: () => void }) => {
  const [d, setD] = useState({
    tracking_number: row.tracking_number,
    dealer_id: row.dealer_id ?? "",
    dealer_name: row.dealer_name,
    destination_city: row.destination_city,
    destination_state: row.destination_state,
    lr_number: row.lr_number ?? "",
    transport_company: row.transport_company ?? row.carrier ?? "",
    driver_name: row.driver_name ?? "",
    driver_phone: row.driver_phone ?? "",
    product_summary: row.product_summary ?? "",
    quantity_summary: row.quantity_summary ?? "",
    expected_delivery_at: row.expected_delivery_at ?? "",
    notes: row.notes ?? "",
  });
  const save = async () => {
    const { error } = await supabase.from("dispatches").update({
      tracking_number: d.tracking_number,
      dealer_id: d.dealer_id || null,
      dealer_name: d.dealer_name,
      destination_city: d.destination_city,
      destination_state: d.destination_state,
      lr_number: d.lr_number || null,
      transport_company: d.transport_company || null,
      carrier: d.transport_company || null,
      driver_name: d.driver_name || null,
      driver_phone: d.driver_phone || null,
      product_summary: d.product_summary || null,
      quantity_summary: d.quantity_summary || null,
      expected_delivery_at: d.expected_delivery_at || null,
      notes: d.notes || null,
    }).eq("id", row.id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    onSaved();
  };
  return (
    <EditDialog title={`Edit ${row.tracking_number}`} onSave={save}>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Tracking #</Label><Input value={d.tracking_number} onChange={(e) => setD({ ...d, tracking_number: e.target.value.toUpperCase() })} /></div>
        <div>
          <Label>Dealer</Label>
          <Select value={d.dealer_id} onValueChange={(v) => {
            const x = dealers.find((y) => y.id === v);
            setD({ ...d, dealer_id: v, dealer_name: x?.name ?? d.dealer_name, destination_city: x?.city ?? d.destination_city, destination_state: x?.state ?? d.destination_state });
          }}>
            <SelectTrigger><SelectValue placeholder="Link dealer" /></SelectTrigger>
            <SelectContent>{dealers.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Dealer name</Label><Input value={d.dealer_name} onChange={(e) => setD({ ...d, dealer_name: e.target.value })} /></div>
        <div><Label>LR Number</Label><Input value={d.lr_number} onChange={(e) => setD({ ...d, lr_number: e.target.value })} /></div>
        <div><Label>Transport</Label><Input value={d.transport_company} onChange={(e) => setD({ ...d, transport_company: e.target.value })} /></div>
        <div><Label>Expected delivery</Label><Input type="date" value={d.expected_delivery_at?.toString().slice(0,10)} onChange={(e) => setD({ ...d, expected_delivery_at: e.target.value })} /></div>
        <div><Label>Driver name</Label><Input value={d.driver_name} onChange={(e) => setD({ ...d, driver_name: e.target.value })} /></div>
        <div><Label>Driver phone</Label><Input value={d.driver_phone} onChange={(e) => setD({ ...d, driver_phone: e.target.value })} /></div>
        <div><Label>City</Label><Input value={d.destination_city} onChange={(e) => setD({ ...d, destination_city: e.target.value })} /></div>
        <div><Label>State</Label><Input value={d.destination_state} onChange={(e) => setD({ ...d, destination_state: e.target.value })} /></div>
        <div className="col-span-2"><Label>Products summary</Label><Input value={d.product_summary} onChange={(e) => setD({ ...d, product_summary: e.target.value })} /></div>
        <div className="col-span-2"><Label>Quantity</Label><Input value={d.quantity_summary} onChange={(e) => setD({ ...d, quantity_summary: e.target.value })} /></div>
        <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} /></div>
      </div>
    </EditDialog>
  );
};
