import { useState } from "react";
import { Calculator, Droplets, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const SprayCalculator = () => {
  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [dosageType, setDosageType] = useState("");
  const [customDosage, setCustomDosage] = useState("");
  const [result, setResult] = useState<{ water: number; pesticide: number } | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Spray Dosage Calculator
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

        <Button onClick={calculate} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate
        </Button>

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
            <p className="text-xs text-muted-foreground">
              ⚠️ This is an approximate calculation. Always refer to the product label for exact dosage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SprayCalculator;
