import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Pencil, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STATES = ["Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka", "Andhra Pradesh", "Telangana", "Other"];
const CROP_OPTIONS = ["Cotton", "Soybean", "Onion", "Wheat", "Sugarcane", "Tomato", "Chilli", "Maize", "Grapes"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिन्दी" },
];

interface FarmerProfile {
  full_name: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  crops: string[] | null;
  land_size_acres: number | null;
  preferred_language: string | null;
}

const empty: FarmerProfile = {
  full_name: "", phone: "", state: "", district: "", taluka: "",
  crops: [], land_size_acres: null, preferred_language: "en",
};

const ProfileCard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile>(empty);
  const [draft, setDraft] = useState<FarmerProfile>(empty);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, state, district, taluka, crops, land_size_acres, preferred_language")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = { ...empty, ...data } as FarmerProfile;
          setProfile(p);
          setDraft(p);
        }
      });
  }, [user]);

  const startEdit = () => { setDraft(profile); setEditing(true); };
  const cancel = () => { setDraft(profile); setEditing(false); };

  const toggleCrop = (c: string) => {
    const cur = draft.crops ?? [];
    setDraft({ ...draft, crops: cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c] });
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      full_name: draft.full_name?.trim() || null,
      phone: draft.phone?.trim() || null,
      state: draft.state || null,
      district: draft.district?.trim() || null,
      taluka: draft.taluka?.trim() || null,
      crops: draft.crops ?? [],
      land_size_acres: draft.land_size_acres != null && String(draft.land_size_acres) !== "" ? Number(draft.land_size_acres) : null,
      preferred_language: draft.preferred_language || "en",
    };
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return; }
    setProfile({ ...draft, ...payload } as FarmerProfile);
    setEditing(false);
    toast({ title: "Profile updated" });
  };

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg">My Profile</h2>
        </div>
        {!editing ? (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Pencil className="h-4 w-4 mr-1.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={cancel} disabled={saving}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="space-y-0">
          <Row label="Full name" value={profile.full_name} />
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={profile.phone} />
          <Row label="State" value={profile.state} />
          <Row label="District" value={profile.district} />
          <Row label="Taluka / Village" value={profile.taluka} />
          <Row label="Land size (acres)" value={profile.land_size_acres ?? ""} />
          <Row label="Crops" value={profile.crops?.length ? profile.crops.join(", ") : ""} />
          <Row label="Preferred language" value={LANGUAGES.find((l) => l.code === profile.preferred_language)?.label ?? "English"} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Full name</Label>
              <Input value={draft.full_name ?? ""} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>State</Label>
              <Select value={draft.state ?? ""} onValueChange={(v) => setDraft({ ...draft, state: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>District</Label>
              <Input value={draft.district ?? ""} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Taluka / Village</Label>
              <Input value={draft.taluka ?? ""} onChange={(e) => setDraft({ ...draft, taluka: e.target.value })} />
            </div>
            <div>
              <Label>Land size (acres)</Label>
              <Input type="number" min={0} step={0.1}
                value={draft.land_size_acres ?? ""}
                onChange={(e) => setDraft({ ...draft, land_size_acres: e.target.value === "" ? null : Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Crops you grow</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {CROP_OPTIONS.map((c) => (
                <label key={c} className="flex items-center gap-1.5 text-xs">
                  <Checkbox checked={(draft.crops ?? []).includes(c)} onCheckedChange={() => toggleCrop(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Preferred language</Label>
            <Select value={draft.preferred_language ?? "en"} onValueChange={(v) => setDraft({ ...draft, preferred_language: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProfileCard;