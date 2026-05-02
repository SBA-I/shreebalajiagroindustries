import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dealer { id: string; name: string; city: string; }
interface Product { id: string; name: string; }
interface Stock {
  id: string; dealer_id: string; product_id: string;
  status: string; arriving_on: string | null; notes: string | null;
}

const STATUSES = [
  { value: "in_stock", label: "In Stock", tone: "bg-emerald-100 text-emerald-800" },
  { value: "low_stock", label: "Low Stock", tone: "bg-amber-100 text-amber-800" },
  { value: "out_of_stock", label: "Out of Stock", tone: "bg-rose-100 text-rose-800" },
  { value: "arriving", label: "Arriving Soon", tone: "bg-blue-100 text-blue-800" },
];

const tone = (s: string) => STATUSES.find((x) => x.value === s)?.tone ?? "bg-muted text-muted-foreground";
const label = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

const AdminDealerStockManager = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealerFilter, setDealerFilter] = useState<string>("");
  const [q, setQ] = useState("");

  const [form, setForm] = useState({ dealer_id: "", product_id: "", status: "in_stock", arriving_on: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [dl, pl, sl] = await Promise.all([
      supabase.from("dealers").select("id,name,city").eq("is_active", true).order("name"),
      supabase.from("products").select("id,name").eq("is_active", true).order("name"),
      supabase.from("dealer_stock").select("*").order("updated_at", { ascending: false }),
    ]);
    setDealers((dl.data ?? []) as Dealer[]);
    setProducts((pl.data ?? []) as Product[]);
    setRows((sl.data ?? []) as Stock[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const dealerName = (id: string) => dealers.find((d) => d.id === id)?.name ?? id;
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  const filtered = useMemo(() => rows.filter((r) => {
    if (dealerFilter && r.dealer_id !== dealerFilter) return false;
    if (q) {
      const hay = `${dealerName(r.dealer_id)} ${productName(r.product_id)}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [rows, dealerFilter, q, dealers, products]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dealer_id || !form.product_id) return toast.error("Pick a dealer and product");
    setBusy(true);
    const { error } = await supabase.from("dealer_stock").upsert({
      dealer_id: form.dealer_id,
      product_id: form.product_id,
      status: form.status,
      arriving_on: form.arriving_on || null,
      notes: form.notes || null,
    } as any, { onConflict: "dealer_id,product_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Stock saved");
    setForm({ dealer_id: form.dealer_id, product_id: "", status: "in_stock", arriving_on: "", notes: "" });
    refresh();
  };

  const updateRow = async (id: string, patch: Partial<Stock>) => {
    const { error } = await supabase.from("dealer_stock").update(patch as any).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this stock entry?")) return;
    await supabase.from("dealer_stock").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Set dealer stock</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label>Dealer</Label>
              <Select value={form.dealer_id} onValueChange={(v) => setForm({ ...form, dealer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick dealer" /></SelectTrigger>
                <SelectContent>{dealers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.city}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Product</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Arriving on</Label><Input type="date" value={form.arriving_on} onChange={(e) => setForm({ ...form, arriving_on: e.target.value })} /></div>
            <div className="md:col-span-3"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. 5 L cans available" /></div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" disabled={busy} className="w-full gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock entries ({filtered.length})</CardTitle>
          <div className="flex gap-2 pt-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8 w-60" placeholder="Search dealer/product…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={dealerFilter} onValueChange={setDealerFilter}>
              <SelectTrigger className="w-60"><SelectValue placeholder="Filter by dealer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All dealers</SelectItem>
                {dealers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No stock entries.</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{productName(r.product_id)}</p>
                    <p className="text-xs text-muted-foreground">{dealerName(r.dealer_id)}{r.arriving_on ? ` · ETA ${r.arriving_on}` : ""}{r.notes ? ` · ${r.notes}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge className={tone(r.status)}>{label(r.status)}</Badge>
                    <Select value={r.status} onValueChange={(v) => updateRow(r.id, { status: v })}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
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

export default AdminDealerStockManager;
