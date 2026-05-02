import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dealer { id: string; name: string; city: string; }
interface Invoice {
  id: string; dealer_id: string; invoice_number: string; invoice_date: string;
  product_summary: string | null; quantity_summary: string | null;
  status: string; pdf_url: string;
}

const STATUSES = [
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "returns_processed", label: "Returns Processed" },
];

const blank = { dealer_id: "", invoice_number: "", invoice_date: new Date().toISOString().slice(0, 10), product_summary: "", quantity_summary: "", status: "dispatched" };

const AdminInvoicesManager = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [d, inv] = await Promise.all([
      supabase.from("dealers").select("id,name,city").eq("is_active", true).order("name"),
      supabase.from("dealer_invoices").select("*").order("invoice_date", { ascending: false }),
    ]);
    setDealers((d.data ?? []) as Dealer[]);
    setInvoices((inv.data ?? []) as Invoice[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dealer_id || !form.invoice_number || !file) return toast.error("Select dealer, invoice no., and PDF");
    if (file.type !== "application/pdf") return toast.error("Only PDF allowed");
    setBusy(true);
    const path = `${form.dealer_id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("dealer-invoices").upload(path, file, { contentType: "application/pdf" });
    if (up.error) { setBusy(false); return toast.error(up.error.message); }
    const { error } = await supabase.from("dealer_invoices").insert({
      dealer_id: form.dealer_id,
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      product_summary: form.product_summary || null,
      quantity_summary: form.quantity_summary || null,
      status: form.status,
      pdf_url: path,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Invoice uploaded");
    setForm(blank); setFile(null);
    refresh();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("dealer_invoices").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    await supabase.storage.from("dealer-invoices").remove([inv.pdf_url]);
    await supabase.from("dealer_invoices").delete().eq("id", inv.id);
    refresh();
  };

  const dealerName = (id: string) => dealers.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload Shipment Invoice / Challan</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label>Dealer *</Label>
              <Select value={form.dealer_id} onValueChange={(v) => setForm({ ...form, dealer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choose dealer" /></SelectTrigger>
                <SelectContent>
                  {dealers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Invoice No. *</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="SBA/2026/045" /></div>
            <div><Label>Invoice Date</Label><Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} /></div>
            <div><Label>Products</Label><Input value={form.product_summary} onChange={(e) => setForm({ ...form, product_summary: e.target.value })} placeholder="Jaguar, Jaadu" /></div>
            <div><Label>Quantity</Label><Input value={form.quantity_summary} onChange={(e) => setForm({ ...form, quantity_summary: e.target.value })} placeholder="20 L + 5 kg" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label>PDF File *</Label>
              <Input type="file" accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Uploaded Invoices ({invoices.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices uploaded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{inv.invoice_number} · {dealerName(inv.dealer_id)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {inv.invoice_date} · {inv.product_summary ?? "—"} · {inv.quantity_summary ?? "—"}
                    </p>
                  </div>
                  <Select value={inv.status} onValueChange={(v) => updateStatus(inv.id, v)}>
                    <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => remove(inv)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoicesManager;