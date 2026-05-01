import { useEffect, useState } from "react";
import { Calculator, Droplets, Sprout, Save, History, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const crops = [
  { name: "Cotton", waterPerAcre: 200 },
  { name: "Rice / Paddy", waterPerAcre: 200 },
  { name: "Wheat", waterPerAcre: 150 },
  { name: "Soybean", waterPerAcre: 200 },
  { name: "Tomato", waterPerAcre: 200 },
  { name: "Chilli", waterPerAcre: 200 },
  { name: "Grapes", waterPerAcre: 500 },
  { name: "Mango", waterPerAcre: 500 },
  { name: "Sugarcane", waterPerAcre: 250 },
  { name: "Vegetables (General)", waterPerAcre: 200 },
];

const dosageOptions = [
  { label: "0.5 ml/L", mlPerLiter: 0.5 },
  { label: "1 ml/L", mlPerLiter: 1 },
  { label: "1.5 ml/L", mlPerLiter: 1.5 },
  { label: "2 ml/L", mlPerLiter: 2 },
  { label: "2.5 ml/L", mlPerLiter: 2.5 },
  { label: "3 ml/L", mlPerLiter: 3 },
  { label: "Custom", mlPerLiter: 0 },
];

interface SprayProfile {
  crop: string;
  acres: string;
  dosageType: string;
  customDosage: string;
}

interface SprayHistoryEntry extends SprayProfile {
  id: string;
  date: string;
  water: number;
  pesticide: number;
}

const PROFILE_KEY = "sba.spray.profile";
const HISTORY_KEY = "sba.spray.history";

const SprayCalculator = () => {
  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [dosageType, setDosageType] = useState("");
  const [customDosage, setCustomDosage] = useState("");
  const [result, setResult] = useState<{ water: number; pesticide: number } | null>(null);
  const [history, setHistory] = useState<SprayHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // Load remembered profile + history on mount
  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) {
        const parsed = JSON.parse(p) as SprayProfile;
        setCrop(parsed.crop || "");
        setAcres(parsed.acres || "");
        setDosageType(parsed.dosageType || "");
        setCustomDosage(parsed.customDosage || "");
      }
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch { /* noop */ }

    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  const calculate = () => {
    const selectedCrop = crops.find((c) => c.name === crop);
    if (!selectedCrop || !acres) return;

    const fieldAcres = parseFloat(acres);
    if (isNaN(fieldAcres) || fieldAcres <= 0) return;

    const dosageObj = dosageOptions.find((d) => d.label === dosageType);
    const mlPerLiter = dosageObj?.mlPerLiter === 0 ? parseFloat(customDosage) : dosageObj?.mlPerLiter || 0;
    if (!mlPerLiter || mlPerLiter <= 0) return;

    const totalWater = selectedCrop.waterPerAcre * fieldAcres;
    const totalPesticide = mlPerLiter * totalWater;

    setResult({ water: totalWater, pesticide: totalPesticide });
  };

  const saveProfile = () => {
    if (!crop || !acres) {
      toast.error("Fill crop & acres first");
      return;
    }
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ crop, acres, dosageType, customDosage } as SprayProfile)
      );
      toast.success("Field profile saved on this device");
    } catch {
      toast.error("Could not save profile");
    }
  };

  const logSpray = () => {
    if (!result) return;
    const entry: SprayHistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      crop, acres, dosageType, customDosage,
      water: result.water,
      pesticide: result.pesticide,
    };
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
    toast.success("Spray logged to your history");
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    toast.success("History cleared");
  };

  const deleteEntry = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const lastSprayDays = (() => {
    const last = history.find((h) => h.crop === crop);
    if (!last) return null;
    const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000);
    return days;
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Spray Dosage Calculator
          </span>
          {!online && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <WifiOff className="h-3 w-3" /> Offline ready
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Crop</label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
            <SelectContent>
              {crops.map((c) => (
                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {lastSprayDays !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              📅 Last spray on {crop}: {lastSprayDays === 0 ? "today" : `${lastSprayDays} day(s) ago`}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Field Size (Acres)</label>
          <Input
            type="number"
            placeholder="e.g. 2"
            value={acres}
            onChange={(e) => setAcres(e.target.value)}
            min="0.1"
            step="0.1"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Dosage Rate</label>
          <Select value={dosageType} onValueChange={setDosageType}>
            <SelectTrigger><SelectValue placeholder="Select dosage" /></SelectTrigger>
            <SelectContent>
              {dosageOptions.map((d) => (
                <SelectItem key={d.label} value={d.label}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {dosageType === "Custom" && (
          <div>
            <label className="text-sm font-medium mb-1.5 block">Custom Dosage (ml/L)</label>
            <Input
              type="number"
              placeholder="e.g. 1.5"
              value={customDosage}
              onChange={(e) => setCustomDosage(e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={calculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          <Button onClick={saveProfile} variant="outline" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Field
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 space-y-3">
            <h4 className="font-bold text-sm text-primary">Spray Requirements</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Water Needed</p>
                  <p className="font-bold text-lg">{result.water} L</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pesticide Needed</p>
                  <p className="font-bold text-lg">
                    {result.pesticide >= 1000
                      ? `${(result.pesticide / 1000).toFixed(1)} L`
                      : `${result.pesticide.toFixed(0)} ml`}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={logSpray} size="sm" variant="secondary" className="w-full">
              <History className="h-3.5 w-3.5 mr-2" /> Log this spray
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚠️ Approximate calculation. Always refer to the product label.
            </p>
          </div>
        )}

        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <History className="h-3.5 w-3.5" />
            {showHistory ? "Hide" : "Show"} spray history ({history.length})
          </button>
          {showHistory && history.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="flex items-start justify-between gap-2 p-2 rounded-md bg-muted text-xs">
                  <div>
                    <p className="font-medium">{h.crop} • {h.acres} acres</p>
                    <p className="text-muted-foreground">
                      {new Date(h.date).toLocaleDateString()} • {h.dosageType} • {h.water}L water
                    </p>
                  </div>
                  <button onClick={() => deleteEntry(h.id)} aria-label="Delete entry">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
              <Button onClick={clearHistory} variant="ghost" size="sm" className="w-full text-destructive">
                Clear all history
              </Button>
            </div>
          )}
          {showHistory && history.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">No spray records yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SprayCalculator;
