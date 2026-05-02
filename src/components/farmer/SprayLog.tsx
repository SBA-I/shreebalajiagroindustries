import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SprayCan, Plus, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { DEFAULT_PHI_BY_CATEGORY, PHI_LIBRARY } from "@/data/agronomy";

interface SprayLogRow {
  id: string;
  spray_date: string;
  product_name: string;
  product_category: string | null;
  dosage: string | null;
  target_pest: string | null;
  crop: string | null;
  phi_days: number;
  safe_harvest_date: string | null;
}

const SprayLog = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<SprayLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    spray_date: new Date().toISOString().slice(0, 10),
    product_name: products[0]?.name ?? "",
    crop: "",
    target_pest: "",
    dosage: "",
  });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("spray_logs")
      .select("*")
      .order("spray_date", { ascending: false })
      .limit(20);
    setRows((data ?? []) as SprayLogRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const addLog = async () => {
    if (!user || !form.product_name) {
      toast({ title: "Missing fields", description: "Product is required.", variant: "destructive" });
      return;
    }
    const product = products.find((p) => p.name === form.product_name);
    const phiInfo = PHI_LIBRARY.find((p) => p.productName === form.product_name);
    const phi_days = phiInfo?.phiDays ?? (product ? DEFAULT_PHI_BY_CATEGORY[product.category] : 14);

    const { error } = await supabase.from("spray_logs").insert({
      user_id: user.id,
      spray_date: form.spray_date,
      product_name: form.product_name,
      product_category: product?.category ?? null,
      dosage: form.dosage || product?.dosage || null,
      target_pest: form.target_pest || null,
      crop: form.crop || null,
      phi_days,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Spray logged",
      description: `Safe harvest after ${phi_days} days. Harvest Timer started.`,
    });
    setOpen(false);
    setForm({ ...form, target_pest: "", dosage: "", crop: "" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("spray_logs").delete().eq("id", id);
    load();
  };

  const isSafeNow = (date: string | null) => date && new Date(date) <= new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SprayCan className="h-5 w-5 text-primary" /> Digital Spray Log
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add Spray</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a New Spray</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Spray Date</Label>
                <Input type="date" value={form.spray_date} onChange={(e) => setForm({ ...form, spray_date: e.target.value })} />
              </div>
              <div>
                <Label>Product Used</Label>
                <Select value={form.product_name} onValueChange={(v) => setForm({ ...form, product_name: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.name}>{p.name} ({p.categoryLabel})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Crop</Label>
                <Input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="e.g. Cotton" />
              </div>
              <div>
                <Label>Target Pest / Disease</Label>
                <Input value={form.target_pest} onChange={(e) => setForm({ ...form, target_pest: e.target.value })} placeholder="e.g. Bollworm" />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 2 ml/L" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addLog}>Save & Start Harvest Timer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sprays logged yet. Tap "Add Spray" after each application.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const safe = isSafeNow(r.safe_harvest_date);
              return (
                <div key={r.id} className="flex items-start justify-between gap-2 rounded-md border p-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{r.product_name}</p>
                      <Badge variant={safe ? "default" : "destructive"} className="shrink-0 text-[10px]">
                        {safe ? <ShieldCheck className="mr-0.5 h-3 w-3" /> : <AlertCircle className="mr-0.5 h-3 w-3" />}
                        {safe ? "Safe to harvest" : `PHI ${r.phi_days}d`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span translate="no">{new Date(r.spray_date).toLocaleDateString()}</span>
                      {r.crop && <> · {r.crop}</>}
                      {r.target_pest && <> · {r.target_pest}</>}
                    </p>
                    {r.safe_harvest_date && (
                      <p className="text-xs text-muted-foreground">
                        Harvest after <span className="font-medium" translate="no">{new Date(r.safe_harvest_date).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SprayLog;