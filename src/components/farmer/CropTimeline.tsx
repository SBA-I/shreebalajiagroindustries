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
import { Sprout, Plus, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { CROP_MATURITY } from "@/data/agronomy";

interface FarmerCrop {
  id: string;
  crop: string;
  variety: string | null;
  sowing_date: string;
  area_acres: number | null;
}

interface Stage {
  name: string;
  startDay: number;
  endDay: number;
  recommendation: string;
}

const STAGES_BY_CROP: Record<string, Stage[]> = {
  Cotton: [
    { name: "Seedling", startDay: 0, endDay: 25, recommendation: "Apply Jaguar to protect seedlings from sucking pests." },
    { name: "Vegetative", startDay: 26, endDay: 60, recommendation: "Scout for Jassids. Use Phantom if hopper burn appears." },
    { name: "Flowering", startDay: 61, endDay: 100, recommendation: "Apply Jaadu PGR for better flower retention." },
    { name: "Boll Formation", startDay: 101, endDay: 140, recommendation: "Set up pheromone traps. Use Terminator for Pink Bollworm." },
    { name: "Maturity / Harvest", startDay: 141, endDay: 180, recommendation: "Final harvest window. Pick mature bolls promptly." },
  ],
  Soybean: [
    { name: "Seedling", startDay: 0, endDay: 20, recommendation: "Check for Stem Fly. Treat with Phantom if seen." },
    { name: "Vegetative", startDay: 21, endDay: 45, recommendation: "Scout Semilooper — high pressure during humidity." },
    { name: "Flowering", startDay: 46, endDay: 70, recommendation: "Apply Terminator for Tobacco Caterpillar." },
    { name: "Pod Formation", startDay: 71, endDay: 95, recommendation: "Watch for Pod Borer damage." },
    { name: "Maturity / Harvest", startDay: 96, endDay: 110, recommendation: "Harvest at 14% moisture for best storage." },
  ],
  Onion: [
    { name: "Seedling", startDay: 0, endDay: 30, recommendation: "Treat seeds against damping-off." },
    { name: "Vegetative", startDay: 31, endDay: 70, recommendation: "Apply Jaguar for Thrips control." },
    { name: "Bulb Formation", startDay: 71, endDay: 110, recommendation: "Maintain irrigation; watch Purple Blotch." },
    { name: "Maturity / Harvest", startDay: 111, endDay: 150, recommendation: "Cure bulbs in shade for 5 days post-harvest." },
  ],
  Tomato: [
    { name: "Seedling", startDay: 0, endDay: 20, recommendation: "Protect from damping-off and early Aphids." },
    { name: "Vegetative", startDay: 21, endDay: 45, recommendation: "Apply Jaguar for sucking pests." },
    { name: "Flowering", startDay: 46, endDay: 65, recommendation: "Use Jaadu for fruit setting." },
    { name: "Fruiting", startDay: 66, endDay: 85, recommendation: "Watch for Fruit Borer. Use Terminator." },
    { name: "Harvest", startDay: 86, endDay: 110, recommendation: "Pick at breaker stage for best shelf life." },
  ],
  Wheat: [
    { name: "Germination", startDay: 0, endDay: 15, recommendation: "Ensure adequate moisture for crown root initiation." },
    { name: "Tillering", startDay: 16, endDay: 45, recommendation: "First nitrogen top-dress at 21 days." },
    { name: "Booting / Heading", startDay: 46, endDay: 80, recommendation: "Watch for Rust. Apply fungicide if seen." },
    { name: "Grain Fill", startDay: 81, endDay: 110, recommendation: "Light irrigation; avoid lodging." },
    { name: "Maturity", startDay: 111, endDay: 125, recommendation: "Harvest when grain hardens." },
  ],
  Sugarcane: [
    { name: "Germination", startDay: 0, endDay: 45, recommendation: "Maintain moisture for tiller emergence." },
    { name: "Tillering", startDay: 46, endDay: 120, recommendation: "Earthing up + nitrogen application." },
    { name: "Grand Growth", startDay: 121, endDay: 270, recommendation: "Peak water demand. Watch borer pests." },
    { name: "Maturity / Harvest", startDay: 271, endDay: 420, recommendation: "Test brix before harvest scheduling." },
  ],
  Chilli: [
    { name: "Seedling", startDay: 0, endDay: 25, recommendation: "Protect from damping-off." },
    { name: "Vegetative", startDay: 26, endDay: 50, recommendation: "Jaguar for Thrips/Mites." },
    { name: "Flowering", startDay: 51, endDay: 70, recommendation: "Jaadu for flower retention." },
    { name: "Fruiting / Harvest", startDay: 71, endDay: 110, recommendation: "Multiple pickings every 10–15 days." },
  ],
};

const CROP_OPTIONS = Object.keys(STAGES_BY_CROP);

const CropTimeline = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<FarmerCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop: "Cotton", variety: "", sowing_date: "", area_acres: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("farmer_crops")
      .select("*")
      .order("sowing_date", { ascending: false });
    setCrops((data ?? []) as FarmerCrop[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const addCrop = async () => {
    if (!user || !form.crop || !form.sowing_date) {
      toast({ title: "Missing fields", description: "Crop and sowing date are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("farmer_crops").insert({
      user_id: user.id,
      crop: form.crop,
      variety: form.variety || null,
      sowing_date: form.sowing_date,
      area_acres: form.area_acres ? Number(form.area_acres) : null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Crop added", description: `${form.crop} sowing recorded.` });
    setForm({ crop: "Cotton", variety: "", sowing_date: "", area_acres: "" });
    setOpen(false);
    load();
  };

  const removeCrop = async (id: string) => {
    await supabase.from("farmer_crops").delete().eq("id", id);
    load();
  };

  const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sprout className="h-5 w-5 text-primary" /> My Crop Timeline
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Sowing Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Crop</Label>
                <Select value={form.crop} onValueChange={(v) => setForm({ ...form, crop: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CROP_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety (optional)</Label>
                <Input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. BT Hybrid" />
              </div>
              <div>
                <Label>Sowing Date</Label>
                <Input type="date" value={form.sowing_date} onChange={(e) => setForm({ ...form, sowing_date: e.target.value })} />
              </div>
              <div>
                <Label>Area (acres)</Label>
                <Input type="number" min="0" step="0.1" value={form.area_acres} onChange={(e) => setForm({ ...form, area_acres: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addCrop}>Save Crop</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : crops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No crops added yet. Tap "Add Crop" to start your timeline.</p>
        ) : (
          <div className="space-y-5">
            {crops.map((c) => {
              const stages = STAGES_BY_CROP[c.crop] ?? [];
              const days = daysSince(c.sowing_date);
              const totalDays = stages[stages.length - 1]?.endDay ?? 120;
              const progress = Math.min(100, Math.max(0, (days / totalDays) * 100));
              const currentStage = stages.find((s) => days >= s.startDay && days <= s.endDay) ?? stages[stages.length - 1];
              return (
                <div key={c.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{c.crop} {c.variety && <span className="text-muted-foreground">· {c.variety}</span>}</p>
                      <p className="text-xs text-muted-foreground">
                        Sown <span translate="no">{new Date(c.sowing_date).toLocaleDateString()}</span> ·{" "}
                        <span translate="no">Day {days}</span>
                        {c.area_acres && <> · <span translate="no">{c.area_acres} acres</span></>}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeCrop(c.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="relative h-2 w-full rounded-full bg-muted">
                    <div className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {stages.map((s) => {
                      const active = days >= s.startDay && days <= s.endDay;
                      const past = days > s.endDay;
                      return (
                        <Badge
                          key={s.name}
                          variant={active ? "default" : past ? "secondary" : "outline"}
                          className="whitespace-nowrap text-[10px]"
                        >
                          {s.name}
                        </Badge>
                      );
                    })}
                  </div>

                  {currentStage && (
                    <div className="flex items-start gap-2 rounded-md bg-accent/10 p-2 text-xs">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <div>
                        <span className="font-semibold">Balaji Recommendation: </span>
                        {currentStage.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropTimeline;