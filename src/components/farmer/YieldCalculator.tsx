import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown } from "lucide-react";

// Approximate Maharashtra mandi rates (₹ per quintal). Editable defaults.
const CROP_RATES: Record<string, number> = {
  Cotton: 7200,
  Soybean: 4800,
  Onion: 1800,
  Tomato: 1500,
  Wheat: 2400,
  Sugarcane: 320,
  Chilli: 12000,
};

const YieldCalculator = () => {
  const [crop, setCrop] = useState("Cotton");
  const [acres, setAcres] = useState("1");
  const [investment, setInvestment] = useState("25000");
  const [yieldQtl, setYieldQtl] = useState("12");
  const [rate, setRate] = useState(String(CROP_RATES.Cotton));

  const result = useMemo(() => {
    const a = Number(acres) || 0;
    const inv = Number(investment) || 0;
    const y = Number(yieldQtl) || 0;
    const r = Number(rate) || 0;
    const revenue = a * y * r;
    const totalInv = a * inv;
    const profit = revenue - totalInv;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, totalInv, profit, margin };
  }, [acres, investment, yieldQtl, rate]);

  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-5 w-5 text-primary" /> Yield & Profit Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Crop</Label>
            <Select
              value={crop}
              onValueChange={(v) => { setCrop(v); setRate(String(CROP_RATES[v] ?? 0)); }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(CROP_RATES).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Land (acres)</Label>
            <Input type="number" min="0" step="0.1" value={acres} onChange={(e) => setAcres(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Investment / acre (₹)</Label>
            <Input type="number" min="0" value={investment} onChange={(e) => setInvestment(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Yield / acre (qtl)</Label>
            <Input type="number" min="0" step="0.1" value={yieldQtl} onChange={(e) => setYieldQtl(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Mandi rate (₹/qtl)</Label>
            <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="rounded-md bg-muted p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Revenue</p>
            <p className="text-sm font-bold" translate="no">{fmt(result.revenue)}</p>
          </div>
          <div className="rounded-md bg-muted p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Total Cost</p>
            <p className="text-sm font-bold" translate="no">{fmt(result.totalInv)}</p>
          </div>
        </div>

        <div className={`flex items-center justify-between rounded-lg p-3 ${result.profit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
          <div className="flex items-center gap-2">
            {result.profit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="text-[10px] text-muted-foreground">Estimated Profit</p>
              <p className="text-base font-bold" translate="no">{fmt(result.profit)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Margin</p>
            <p className="text-base font-bold" translate="no">{result.margin.toFixed(0)}%</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Mandi rates are indicative. Update with your local rate for accurate planning.
        </p>
      </CardContent>
    </Card>
  );
};

export default YieldCalculator;