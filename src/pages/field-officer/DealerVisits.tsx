import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface DealerVisit {
  id: string;
  dealer_name: string;
  dealer_location: string | null;
  visit_date: string;
  purpose: string | null;
  notes: string | null;
  order_placed: boolean;
  order_amount: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

const DealerVisits = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<DealerVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    dealer_name: "",
    dealer_location: "",
    purpose: "",
    notes: "",
    order_placed: false,
    order_amount: "",
  });

  const fetchVisits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("dealer_visits")
      .select("*")
      .eq("officer_id", user.id)
      .order("visit_date", { ascending: false });
    setVisits((data as DealerVisit[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchVisits(); }, [user]);

  const captureLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const loc = await captureLocation();

    const { error } = await supabase.from("dealer_visits").insert({
      officer_id: user.id,
      dealer_name: form.dealer_name,
      dealer_location: form.dealer_location || null,
      purpose: form.purpose || null,
      notes: form.notes || null,
      order_placed: form.order_placed,
      order_amount: form.order_amount ? parseFloat(form.order_amount) : 0,
      latitude: loc?.lat ?? null,
      longitude: loc?.lng ?? null,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to save visit");
    } else {
      toast.success("Visit logged successfully!" + (loc ? " 📍 Location captured." : ""));
      setForm({ dealer_name: "", dealer_location: "", purpose: "", notes: "", order_placed: false, order_amount: "" });
      setDialogOpen(false);
      fetchVisits();
    }
  };

  return (
    <FieldOfficerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Dealer Visits</h1>
            <p className="text-muted-foreground">Log and track your dealer visit reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Visit</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log Dealer Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Dealer Name *</label>
                  <Input value={form.dealer_name} onChange={(e) => setForm({ ...form, dealer_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Input value={form.dealer_location} onChange={(e) => setForm({ ...form, dealer_location: e.target.value })} placeholder="City / Area" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Purpose</label>
                  <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Order follow-up, new dealer, etc." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.order_placed} onCheckedChange={(c) => setForm({ ...form, order_placed: !!c })} />
                  <label className="text-sm">Order placed during visit</label>
                </div>
                {form.order_placed && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Order Amount (₹)</label>
                    <Input type="number" value={form.order_amount} onChange={(e) => setForm({ ...form, order_amount: e.target.value })} />
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  GPS location will be captured automatically
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Log Visit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : visits.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No visits logged yet. Click "New Visit" to get started.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {visits.map((v) => (
              <Card key={v.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{v.dealer_name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{new Date(v.visit_date).toLocaleDateString("en-IN")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {v.dealer_location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{v.dealer_location}</p>}
                  {v.purpose && <p className="text-sm"><span className="font-medium">Purpose:</span> {v.purpose}</p>}
                  {v.notes && <p className="text-sm text-muted-foreground">{v.notes}</p>}
                  <div className="flex items-center gap-4 pt-1">
                    {v.order_placed && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Order: ₹{v.order_amount.toLocaleString()}</span>}
                    {v.latitude && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />GPS logged</span>}
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

export default DealerVisits;
