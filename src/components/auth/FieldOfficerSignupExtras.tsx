import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExtraFieldsData } from "./RoleAuthForm";

interface Props {
  value: ExtraFieldsData;
  onChange: (next: ExtraFieldsData) => void;
}

export const validateOfficerExtras = (v: ExtraFieldsData): string | null => {
  if (!v.employee_id || String(v.employee_id).trim().length < 2) return "Employee ID is required";
  if (!v.assigned_territory || String(v.assigned_territory).trim().length < 2)
    return "Assigned territory is required";
  return null;
};

export const officerExtrasToMetadata = (v: ExtraFieldsData) => ({
  employee_id: v.employee_id || null,
  assigned_territory: v.assigned_territory || null,
});

const FieldOfficerSignupExtras = ({ value, onChange }: Props) => (
  <div className="space-y-3 pt-2 border-t border-border">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      Officer details
    </p>
    <div>
      <Label htmlFor="off-emp">Employee ID *</Label>
      <Input
        id="off-emp"
        value={(value.employee_id as string) ?? ""}
        onChange={(e) => onChange({ ...value, employee_id: e.target.value })}
        placeholder="e.g. SBAI-FO-021"
      />
      <p className="text-[11px] text-muted-foreground mt-1">Provided by your reporting manager.</p>
    </div>
    <div>
      <Label htmlFor="off-terr">Assigned territory *</Label>
      <Input
        id="off-terr"
        value={(value.assigned_territory as string) ?? ""}
        onChange={(e) => onChange({ ...value, assigned_territory: e.target.value })}
        placeholder="e.g. Dhule, Jalgaon, Nandurbar"
      />
    </div>
  </div>
);

export default FieldOfficerSignupExtras;