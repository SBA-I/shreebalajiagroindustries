import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, IndianRupee, Sprout, Droplets, Beaker } from "lucide-react";

// Regional baseline data (per acre). Prices in INR, yield in quintals.
// Sourced from public Indian agricultural advisory averages — used for indicative simulation only.
interface CropBaseline {
  name: string;
  baseYieldQtl: number;        // typical yield (quintals / acre)
  basePriceQtl: number;        // typical mandi price (INR / quintal)
  baseSeedCost: number;        // INR / acre
  baseFertilizerCost: number;  // INR / acre
  basePesticideCost: number;   // INR / acre
  baseLaborCost: number;       // INR / acre
  baseWaterCost: number;       // INR / acre
  // Sensitivities: how a normalized factor (0..2 of baseline) affects yield
  waterSensitivity: number;    // weight on water vs. baseline
  pesticideSensitivity: number;
  fertilizerSensitivity: number;
}

const baselines: CropBaseline[] = [
  { name: "Cotton", baseYieldQtl: 12, basePriceQtl: 7000, baseSeedCost: 3500, baseFertilizerCost: 6000, basePesticideCost: 5000, baseLaborCost: 12000, baseWaterCost: 3000, waterSensitivity: 0.35, pesticideSensitivity: 0.25, fertilizerSensitivity: 0.30 },
  { name: "Wheat", baseYieldQtl: 18, basePriceQtl: 2300, baseSeedCost: 1800, baseFertilizerCost: 4500, basePesticideCost: 1500, baseLaborCost: 6000, baseWaterCost: 2500, waterSensitivity: 0.40, pesticideSensitivity: 0.10, fertilizerSensitivity: 0.35 },
  { name: "Rice / Paddy", baseYieldQtl: 22, basePriceQtl: 2200, baseSeedCost: 2000, baseFertilizerCost: 5000, basePesticideCost: 2500, baseLaborCost: 9000, baseWaterCost: 4000, waterSensitivity: 0.45, pesticideSensitivity: 0.15, fertilizerSensitivity: 0.30 },
  { name: "Soybean", baseYieldQtl: 10, basePriceQtl: 4500, baseSeedCost: 2500, baseFertilizerCost: 3500, basePesticideCost: 2000, baseLaborCost: 5000, baseWaterCost: 1500, waterSensitivity: 0.30, pesticideSensitivity: 0.20, fertilizerSensitivity: 0.30 },
  { name: "Tomato", baseYieldQtl: 120, basePriceQtl: 1500, baseSeedCost: 8000, baseFertilizerCost: 10000, basePesticideCost: 8000, baseLaborCost: 18000, baseWaterCost: 4000, waterSensitivity: 0.40, pesticideSensitivity: 0.30, fertilizerSensitivity: 0.30 },
  { name: "Sugarcane", baseYieldQtl: 350, basePriceQtl: 320, baseSeedCost: 8000, baseFertilizerCost: 9000, basePesticideCost: 4000, baseLaborCost: 15000, baseWaterCost: 7000, waterSensitivity: 0.50, pesticideSensitivity: 0.10, fertilizerSensitivity: 0.30 },
  { name: "Chilli", baseYieldQtl: 25, basePriceQtl: 12000, baseSeedCost: 5000, baseFertilizerCost: 8000, basePesticideCost: 7000, baseLaborCost: 14000, baseWaterCost: 3500, waterSensitivity: 0.35, pesticideSensitivity: 0.30, fertilizerSensitivity: 0.30 },
  { name: "Grapes", baseYieldQtl: 80, basePriceQtl: 5500, baseSeedCost: 0, baseFertilizerCost: 15000, basePesticideCost: 12000, baseLaborCost: 25000, baseWaterCost: 6000, waterSensitivity: 0.40, pesticideSensitivity: 0.30, fertilizerSensitivity: 0.25 },
];

// Random Forest-inspired multiplier: combines normalized factors with diminishing returns.
// Each factor f is in [0..2]; effect = 1 + sensitivity * (1 - 1/(1 + (f-1)*2)) capped to reasonable bounds.
const yieldMultiplier = (factor: number, sensitivity: number) => {
  // Diminishing returns curve, symmetric loss for under-application
  const delta = factor - 1;
  const curve = delta >= 0
    ? 1 - Math.exp(-delta * 1.2) // saturates around 1
    : -1 + Math.exp(delta * 1.5); // sharper drop on deficit
  return 1 + sensitivity * curve;
};

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const YieldSimulator = () => {
  const [cropName, setCropName] = useState(baselines[0].name);
  const [acres, setAcres] = useState(1);
  // Factors are 0..200 (% of baseline). Default 100.
  const [waterFactor, setWaterFactor] = useState(100);
  const [pesticideFactor, setPesticideFactor] = useState(100);
  const [fertilizerFactor, setFertilizerFactor] = useState(100);
  const [pricePctOfBase, setPricePctOfBase] = useState(100);
  const [seedFactor, setSeedFactor] = useState(100);
  const [laborFactor, setLaborFactor] = useState(100);

  const baseline = baselines.find((b) => b.name === cropName) ?? baselines[0];

  const sim = useMemo(() => {
    const wf = waterFactor / 100;
    const pf = pesticideFactor / 100;
    const ff = fertilizerFactor / 100;

    const yieldMult =
      yieldMultiplier(wf, baseline.waterSensitivity) *
      yieldMultiplier(pf, baseline.pesticideSensitivity) *
      yieldMultiplier(ff, baseline.fertilizerSensitivity);

    const yieldQtl = Math.max(0, baseline.baseYieldQtl * yieldMult * acres);
    const priceQtl = baseline.basePriceQtl * (pricePctOfBase / 100);
    const revenue = yieldQtl * priceQtl;

    const cost =
      (baseline.baseSeedCost * (seedFactor / 100) +
        baseline.baseFertilizerCost * ff +
        baseline.basePesticideCost * pf +
        baseline.baseLaborCost * (laborFactor / 100) +
        baseline.baseWaterCost * wf) *
      acres;

    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const breakEvenPrice = yieldQtl > 0 ? cost / yieldQtl : 0;

    return { yieldQtl, revenue, cost, profit, margin, priceQtl, breakEvenPrice };
  }, [baseline, acres, waterFactor, pesticideFactor, fertilizerFactor, pricePctOfBase, seedFactor, laborFactor]);

  const reset = () => {
    setWaterFactor(100); setPesticideFactor(100); setFertilizerFactor(100);
    setPricePctOfBase(100); setSeedFactor(100); setLaborFactor(100);
  };

  const SliderRow = ({
    label, value, set, icon: Icon, hint,
  }: { label: string; value: number; set: (v: number) => void; icon: any; hint?: string }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </span>
        <span className="text-sm tabular-nums font-semibold">{value}%</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => set(v[0])} min={20} max={180} step={5} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            Yield &amp; Profit Simulator
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Move the sliders to see how inputs and mandi price affect your profit — runs entirely on your device.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Crop &amp; Field</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Crop</label>
                    <Select value={cropName} onValueChange={setCropName}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {baselines.map((b) => (
                          <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Field Size</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm tabular-nums">{acres} acre(s)</span>
                    </div>
                    <Slider value={[acres]} onValueChange={(v) => setAcres(v[0])} min={0.5} max={50} step={0.5} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Inputs (% of typical)</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <SliderRow label="Water" value={waterFactor} set={setWaterFactor} icon={Droplets} hint="Below 100% = water stress, above 100% = excess" />
                  <SliderRow label="Pesticide / Crop Protection" value={pesticideFactor} set={setPesticideFactor} icon={Beaker} />
                  <SliderRow label="Fertilizer" value={fertilizerFactor} set={setFertilizerFactor} icon={Sprout} />
                  <SliderRow label="Seed Quality / Cost" value={seedFactor} set={setSeedFactor} icon={Sprout} />
                  <SliderRow label="Labor Cost" value={laborFactor} set={setLaborFactor} icon={Sprout} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Expected Mandi Price</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <SliderRow
                    label={`Price (typical: ${inr(baseline.basePriceQtl)}/qtl)`}
                    value={pricePctOfBase}
                    set={setPricePctOfBase}
                    icon={IndianRupee}
                    hint={`Current setting: ${inr(sim.priceQtl)} per quintal`}
                  />
                  <button onClick={reset} className="text-xs text-primary hover:underline">Reset all to typical (100%)</button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-4 lg:sticky lg:top-20 self-start">
              <Card className={sim.profit >= 0 ? "border-primary/30" : "border-destructive/40"}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {sim.profit >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    Estimated Profit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Net profit (per season)</p>
                    <p className={`font-heading text-3xl font-bold ${sim.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                      {inr(sim.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground">Margin: {sim.margin.toFixed(1)}%</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Yield</p>
                      <p className="font-semibold">{sim.yieldQtl.toFixed(1)} qtl</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{inr(sim.revenue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="font-semibold">{inr(sim.cost)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Break-even</p>
                      <p className="font-semibold">{inr(sim.breakEvenPrice)}/qtl</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground border-t pt-3">
                    ⚠️ Estimates only, based on typical regional averages. Actual results vary by soil, weather, variety, and market.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default YieldSimulator;