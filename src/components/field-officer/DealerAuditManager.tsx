import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Audit {
  id: string; audit_date: string; dealer_name: string; signage_visible: boolean;
  shelves_stocked: boolean; marketing_material_needed: boolean; staff_trained: boolean;
  rating: number | null; notes: string | null; photo_url: string | null;
}
interface DealerLite { id: string; name: string; city: string; }

const DealerAuditManager = ({ userId }: { userId: string }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [dealers, setDealers] = useState<DealerLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [form, setForm] = useState({
    dealer_id: "", dealer_name: "", signage_visible: false, shelves_stocked: false,
    marketing_material_needed: false, staff_trained: false, rating: "4", notes: "",
  });

  const refresh = async () => {
    setLoading(true);
    const [a, d] = await Promise.all([
      supabase.from("dealer_audits").select("*").eq("officer_id", userId).order("audit_date", { ascending: false }).limit(50),
      supabase.from("dealers").select("id,name,city").eq("is_active", true).order("name"),
    ]);
    setAudits((a.data ?? []) as Audit[]);
    setDealers((d.data ?? []) as DealerLite[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [userId]);

  const submit = async () => {
    if (!form.dealer_name.trim() && !form.dealer_id) { toast.error("Select a dealer"); return; }
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const path = `${userId}/audits/${Date.now()}-${photo.name}`;
        const up = await supabase.storage.from("field-officer-photos").upload(path, photo);
        if (up.error) throw up.error;
        photo_url = supabase.storage.from("field-officer-photos").getPublicUrl(path).data.publicUrl;
      }
      let lat: number | null = null, lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      } catch {}
      const dealer = dealers.find(d => d.id === form.dealer_id);
      const { error } = await supabase.from("dealer_audits").insert({
        officer_id: userId,
        dealer_id: form.dealer_id || null,
        dealer_name: dealer?.name || form.dealer_name,
        signage_visible: form.signage_visible,
        shelves_stocked: form.shelves_stocked,
        marketing_material_needed: form.marketing_material_needed,
        staff_trained: form.staff_trained,
        rating: Number(form.rating),
        notes: form.notes || null,
        photo_url, lat, lng,
      });
      if (error) throw error;
      toast.success("Audit submitted");
      setForm({ dealer_id: "", dealer_name: "", signage_visible: false, shelves_stocked: false, marketing_material_needed: false, staff_trained: false, rating: "4", notes: "" });
      setPhoto(null); setOpen(false);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this audit?")) return;
    await supabase.from("dealer_audits").delete().eq("id", id);
    refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Dealer Audits</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />New Audit</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Dealer Audit Checklist</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Dealer</Label>
                <Select value={form.dealer_id} onValueChange={(v) => setForm({ ...form, dealer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose dealer" /></SelectTrigger>
                  <SelectContent>{dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.name} • {d.city}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Or enter name below if not listed:</p>
                <Input className="mt-1" placeholder="Dealer name (manual)" value={form.dealer_name} onChange={(e) => setForm({ ...form, dealer_name: e.target.value })} />
              </div>
              {[
                ["signage_visible", "Balaji signage clearly visible"],
                ["shelves_stocked", "Shelves are well-stocked"],
                ["marketing_material_needed", "Dealer needs more marketing flyers"],
                ["staff_trained", "Staff trained on Balaji products"],
              ].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(form as any)[k]} onCheckedChange={(v) => setForm({ ...form, [k]: !!v })} />
                  {l}
                </label>
              ))}
              <div>
                <Label>Overall Rating (1–5)</Label>
                <Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div>
                <Label>Shop Photo</Label>
                <Input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
              <Button onClick={submit} disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Submit Audit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
          audits.length === 0 ? <p className="text-sm text-muted-foreground">No audits yet.</p> :
          audits.map(a => (
            <div key={a.id} className="border rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{a.dealer_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.audit_date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-1">
                  {a.rating && <span className="flex items-center text-xs"><Star className="h-3 w-3 fill-accent text-accent mr-0.5" />{a.rating}/5</span>}
                  <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className={a.signage_visible ? "text-primary" : "text-muted-foreground"}>● Signage</span>
                <span className={a.shelves_stocked ? "text-primary" : "text-muted-foreground"}>● Stock</span>
                <span className={a.staff_trained ? "text-primary" : "text-muted-foreground"}>● Trained</span>
                {a.marketing_material_needed && <span className="text-destructive">⚠ Needs flyers</span>}
              </div>
              {a.notes && <p className="text-xs">{a.notes}</p>}
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default DealerAuditManager;