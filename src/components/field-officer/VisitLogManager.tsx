import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Camera, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Visit {
  id: string; visit_date: string; farmer_name: string; village: string | null;
  crop: string | null; acreage: number | null; observations: string | null;
  recommendation: string | null; photo_url: string | null; lat: number | null; lng: number | null;
}

const blank = {
  farmer_name: "", farmer_phone: "", village: "", district: "",
  crop: "", acreage: "", observations: "", recommendation: "",
};

const VisitLogManager = ({ userId }: { userId: string }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("field_visits")
      .select("id,visit_date,farmer_name,village,crop,acreage,observations,recommendation,photo_url,lat,lng")
      .eq("officer_id", userId)
      .order("visit_date", { ascending: false })
      .limit(50);
    setVisits((data ?? []) as Visit[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [userId]);

  const submit = async () => {
    if (!form.farmer_name.trim()) { toast.error("Farmer name required"); return; }
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const path = `${userId}/visits/${Date.now()}-${photo.name}`;
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
      const { error } = await supabase.from("field_visits").insert({
        officer_id: userId,
        farmer_name: form.farmer_name,
        farmer_phone: form.farmer_phone || null,
        village: form.village || null,
        district: form.district || null,
        crop: form.crop || null,
        acreage: form.acreage ? Number(form.acreage) : null,
        observations: form.observations || null,
        recommendation: form.recommendation || null,
        photo_url, lat, lng,
      });
      if (error) throw error;
      toast.success("Visit logged");
      setForm(blank); setPhoto(null); setOpen(false);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this visit?")) return;
    await supabase.from("field_visits").delete().eq("id", id);
    refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Field Visits (E-Diary)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Log Visit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Farm Visit</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                ["farmer_name", "Farmer Name *"],
                ["farmer_phone", "Farmer Phone"],
                ["village", "Village"],
                ["district", "District"],
                ["crop", "Crop"],
                ["acreage", "Acreage (acres)"],
              ].map(([k, l]) => (
                <div key={k}>
                  <Label>{l}</Label>
                  <Input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <Label>Observations</Label>
                <Textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} placeholder="e.g. Heavy thrips infestation seen" />
              </div>
              <div>
                <Label>Recommendation</Label>
                <Textarea rows={2} value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} />
              </div>
              <div>
                <Label>Field Photo</Label>
                <Input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
              <Button onClick={submit} disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                Save Visit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
          visits.length === 0 ? <p className="text-sm text-muted-foreground">No visits logged yet.</p> :
          visits.map(v => (
            <div key={v.id} className="border rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{v.farmer_name} <span className="text-muted-foreground font-normal">• {v.village || "—"}</span></div>
                  <div className="text-xs text-muted-foreground">{new Date(v.visit_date).toLocaleDateString()} • {v.crop || "—"} {v.acreage ? `• ${v.acreage} ac` : ""}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              {v.observations && <p className="text-xs"><span className="font-medium">Obs:</span> {v.observations}</p>}
              {v.recommendation && <p className="text-xs"><span className="font-medium">Rec:</span> {v.recommendation}</p>}
              {v.photo_url && <img src={v.photo_url} alt="Visit" className="rounded mt-2 max-h-40 object-cover" />}
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default VisitLogManager;