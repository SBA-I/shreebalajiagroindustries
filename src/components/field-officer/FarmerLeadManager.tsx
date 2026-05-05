import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, UserPlus, Link2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string; farmer_name: string; phone: string | null; village: string | null;
  district: string | null; crops: string[] | null; status: string; linked_dealer_id: string | null;
  created_at: string;
}

const blank = {
  farmer_name: "", phone: "", village: "", taluka: "", district: "",
  state: "Maharashtra", pincode: "", crops: "", land_size_acres: "", notes: "",
};

const FarmerLeadManager = ({ userId }: { userId: string }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("farmer_leads")
      .select("id,farmer_name,phone,village,district,crops,status,linked_dealer_id,created_at")
      .eq("officer_id", userId).order("created_at", { ascending: false }).limit(50);
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [userId]);

  const findNearestDealer = async (lat: number | null, lng: number | null, pincode: string) => {
    if (lat && lng) {
      const { data } = await supabase.rpc("nearest_dealers_public", { _lat: lat, _lng: lng, _limit: 1 });
      if (data && data.length) return data[0].id;
    }
    if (pincode) {
      const { data } = await supabase.rpc("search_dealers_public", { _pincode: pincode });
      if (data && data.length) return data[0].id;
    }
    return null;
  };

  const submit = async () => {
    if (!form.farmer_name.trim()) { toast.error("Farmer name required"); return; }
    setBusy(true);
    try {
      let lat: number | null = null, lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      } catch {}
      const linked_dealer_id = await findNearestDealer(lat, lng, form.pincode);
      const crops = form.crops ? form.crops.split(",").map(c => c.trim()).filter(Boolean) : null;
      const { error } = await supabase.from("farmer_leads").insert({
        officer_id: userId,
        farmer_name: form.farmer_name,
        phone: form.phone || null,
        village: form.village || null,
        taluka: form.taluka || null,
        district: form.district || null,
        state: form.state,
        pincode: form.pincode || null,
        crops,
        land_size_acres: form.land_size_acres ? Number(form.land_size_acres) : null,
        notes: form.notes || null,
        lat, lng,
        linked_dealer_id,
      });
      if (error) throw error;
      toast.success(linked_dealer_id ? "Farmer added & linked to nearest dealer" : "Farmer added (no dealer found nearby)");
      setForm(blank); setOpen(false);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("farmer_leads").delete().eq("id", id);
    refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Farmer Leads</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Farmer</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Onboard New Farmer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                ["farmer_name", "Farmer Name *"],
                ["phone", "Phone"],
                ["village", "Village"],
                ["taluka", "Taluka"],
                ["district", "District"],
                ["state", "State"],
                ["pincode", "Pincode"],
                ["crops", "Crops (comma-separated)"],
                ["land_size_acres", "Land Size (acres)"],
              ].map(([k, l]) => (
                <div key={k}>
                  <Label>{l}</Label>
                  <Input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <Label>Notes</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={submit} disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Save & Link to Nearest Dealer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
          leads.length === 0 ? <p className="text-sm text-muted-foreground">No farmer leads yet.</p> :
          leads.map(l => (
            <div key={l.id} className="border rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{l.farmer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.village || "—"} • {l.district || "—"}
                    {l.phone && ` • ${l.phone}`}
                  </div>
                  {l.crops && l.crops.length > 0 && (
                    <div className="text-xs text-muted-foreground">Crops: {l.crops.join(", ")}</div>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="text-xs flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {l.linked_dealer_id ? <span className="text-primary">Linked to dealer</span> : <span className="text-muted-foreground">Not linked</span>}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default FarmerLeadManager;