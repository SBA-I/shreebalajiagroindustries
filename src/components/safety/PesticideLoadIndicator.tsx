import { useMemo, useState } from "react";
import { Leaf, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { calculatePLI, type ChemCategory } from "@/data/firstAid";

interface Props {
  category: ChemCategory;
  defaultDoseMl?: number;
}

const BAND_STYLES: Record<string, { bar: string; text: string; label: string }> = {
  low:        { bar: "bg-primary",       text: "text-primary",       label: "Low impact" },
  moderate:   { bar: "bg-accent",        text: "text-accent-foreground", label: "Moderate impact" },
  high:       { bar: "bg-orange-500",    text: "text-orange-600",    label: "High impact" },
  "very-high":{ bar: "bg-destructive",   text: "text-destructive",   label: "Very high impact" },
};

const PesticideLoadIndicator = ({ category, defaultDoseMl = 2 }: Props) => {
  const [dose, setDose] = useState(defaultDoseMl);
  const [acres, setAcres] = useState(1);
  const [beeFriendly, setBeeFriendly] = useState(false);

  const pli = useMemo(
    () => calculatePLI({ category, doseMlPerLitre: dose, areaAcres: acres, beeFriendly }),
    [category, dose, acres, beeFriendly]
  );

  const style = BAND_STYLES[pli.band];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Leaf className="h-4 w-4 text-primary" />
        <h3 className="font-heading font-semibold text-sm">Pesticide Load Indicator</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Estimate the environmental impact of one spray session. Calculated locally, no data leaves your device.
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">Dose: {dose.toFixed(1)} ml/L</span>
            <span className="text-muted-foreground">0.5 – 5 ml/L</span>
          </div>
          <Slider min={0.5} max={5} step={0.1} value={[dose]} onValueChange={(v) => setDose(v[0])} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">Area: {acres.toFixed(1)} acre</span>
            <span className="text-muted-foreground">0.1 – 20 acres</span>
          </div>
          <Slider min={0.1} max={20} step={0.1} value={[acres]} onValueChange={(v) => setAcres(v[0])} />
        </div>

        <label className="flex items-center justify-between text-xs">
          <span className="font-medium">Apply at dusk (bee-friendly window)</span>
          <Switch checked={beeFriendly} onCheckedChange={setBeeFriendly} />
        </label>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-muted-foreground">Environmental load score</span>
          <span className={`text-2xl font-bold ${style.text}`}>{pli.score}<span className="text-xs text-muted-foreground">/100</span></span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${style.bar} transition-all`} style={{ width: `${pli.score}%` }} />
        </div>
        <p className={`text-xs mt-1.5 font-medium ${style.text}`}>{style.label}</p>
      </div>

      <div className="mt-3 flex gap-2 items-start text-[11px] text-muted-foreground">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <span>Lowering dose, splitting acreage, and dusk-spraying drop the load. Always follow label rates.</span>
      </div>
    </div>
  );
};

export default PesticideLoadIndicator;