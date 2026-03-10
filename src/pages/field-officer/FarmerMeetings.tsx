import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Users, Loader2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FarmerMeeting {
  id: string;
  farmer_name: string;
  farmer_phone: string | null;
  village: string | null;
  crop: string | null;
  problem_reported: string | null;
  product_recommended: string | null;
  meeting_date: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

const FarmerMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<FarmerMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    farmer_name: "", farmer_phone: "", village: "", crop: "",
    problem_reported: "", product_recommended: "", notes: "",
  });

  const fetchMeetings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("farmer_meetings")
      .select("*")
      .eq("officer_id", user.id)
      .order("meeting_date", { ascending: false });
    setMeetings((data as FarmerMeeting[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMeetings(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    let lat: number | null = null, lng: number | null = null;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}
    }

    const { error } = await supabase.from("farmer_meetings").insert({
      officer_id: user.id,
      farmer_name: form.farmer_name,
      farmer_phone: form.farmer_phone || null,
      village: form.village || null,
      crop: form.crop || null,
      problem_reported: form.problem_reported || null,
      product_recommended: form.product_recommended || null,
      notes: form.notes || null,
      latitude: lat,
      longitude: lng,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to save meeting");
    } else {
      toast.success("Meeting recorded!");
      setForm({ farmer_name: "", farmer_phone: "", village: "", crop: "", problem_reported: "", product_recommended: "", notes: "" });
      setDialogOpen(false);
      fetchMeetings();
    }
  };

  return (
    <FieldOfficerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Farmer Meetings</h1>
            <p className="text-muted-foreground">Record farmer interactions and crop advisories</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Meeting</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Farmer Meeting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Farmer Name *</label>
                  <Input value={form.farmer_name} onChange={(e) => setForm({ ...form, farmer_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input value={form.farmer_phone} onChange={(e) => setForm({ ...form, farmer_phone: e.target.value })} placeholder="+91..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Village</label>
                    <Input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Crop</label>
                    <Input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="Cotton, Soybean..." />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Problem Reported</label>
                  <Textarea value={form.problem_reported} onChange={(e) => setForm({ ...form, problem_reported: e.target.value })} rows={2} placeholder="Pest attack, disease symptoms..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Product Recommended</label>
                  <Input value={form.product_recommended} onChange={(e) => setForm({ ...form, product_recommended: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />GPS location will be captured automatically
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Meeting
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : meetings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No meetings recorded yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {meetings.map((m) => (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{m.farmer_name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{new Date(m.meeting_date).toLocaleDateString("en-IN")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    {m.village && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{m.village}</span>}
                    {m.crop && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.crop}</span>}
                  </div>
                  {m.problem_reported && <p className="text-sm"><span className="font-medium">Problem:</span> {m.problem_reported}</p>}
                  {m.product_recommended && <p className="text-sm"><span className="font-medium">Recommended:</span> {m.product_recommended}</p>}
                  {m.notes && <p className="text-sm text-muted-foreground">{m.notes}</p>}
                  <div className="flex items-center gap-4 pt-1">
                    {m.farmer_phone && <span className="text-xs text-muted-foreground">📞 {m.farmer_phone}</span>}
                    {m.latitude && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />GPS logged</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FieldOfficerLayout>
  );
};

export default FarmerMeetings;
