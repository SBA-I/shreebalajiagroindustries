import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExtraFieldsData } from "./RoleAuthForm";

const STATES = ["Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka", "Andhra Pradesh", "Telangana", "Other"];
const CROP_OPTIONS = ["Cotton", "Soybean", "Onion", "Wheat", "Sugarcane", "Tomato", "Chilli", "Maize", "Grapes"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिन्दी" },
];

interface Props {
  value: ExtraFieldsData;
  onChange: (next: ExtraFieldsData) => void;
}

export const validateFarmerExtras = (v: ExtraFieldsData): string | null => {
  if (!v.state) return "Please select your state";
  if (!v.district || String(v.district).trim().length < 2) return "Please enter your district";
  return null;
};

export const farmerExtrasToMetadata = (v: ExtraFieldsData) => ({
  state: v.state || null,
  district: v.district || null,
  taluka: v.taluka || null,
  crops: Array.isArray(v.crops) ? v.crops : [],
  land_size_acres: v.land_size_acres ? String(v.land_size_acres) : null,
  preferred_language: v.preferred_language || "en",
});

const FarmerSignupExtras = ({ value, onChange }: Props) => {
  const crops = useMemo(() => (Array.isArray(value.crops) ? (value.crops as string[]) : []), [value.crops]);
  const toggleCrop = (c: string) => {
    const next = crops.includes(c) ? crops.filter((x) => x !== c) : [...crops, c];
    onChange({ ...value, crops: next });
  };

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farm details</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>State *</Label>
          <Select value={(value.state as string) ?? ""} onValueChange={(v) => onChange({ ...value, state: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="far-district">District *</Label>
          <Input id="far-district" value={(value.district as string) ?? ""} onChange={(e) => onChange({ ...value, district: e.target.value })} placeholder="e.g. Dhule" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="far-taluka">Taluka / Village</Label>
          <Input id="far-taluka" value={(value.taluka as string) ?? ""} onChange={(e) => onChange({ ...value, taluka: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="far-land">Land size (acres)</Label>
          <Input id="far-land" type="number" min={0} step={0.1} value={(value.land_size_acres as string) ?? ""} onChange={(e) => onChange({ ...value, land_size_acres: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>Crops you grow</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {CROP_OPTIONS.map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-xs">
              <Checkbox checked={crops.includes(c)} onCheckedChange={() => toggleCrop(c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred language</Label>
        <Select value={(value.preferred_language as string) ?? "en"} onValueChange={(v) => onChange({ ...value, preferred_language: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FarmerSignupExtras;