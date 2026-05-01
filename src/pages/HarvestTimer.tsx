import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Sprout,
  Leaf,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  PHI_LIBRARY,
  DEFAULT_PHI_BY_CATEGORY,
  CROP_MATURITY,
} from "@/data/agronomy";

interface ProductLite {
  id: string;
  name: string;
  category: string;
  slug?: string;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

// Circular progress ring
const ProgressRing = ({ percent, label, sub, danger }: { percent: number; label: string; sub: string; danger: boolean }) => {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-muted fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`fill-none transition-all duration-700 ${danger ? "stroke-destructive" : "stroke-primary"}`}
          style={{ strokeDasharray: c, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading text-3xl font-bold ${danger ? "text-destructive" : "text-primary"}`}>{label}</span>
        <span className="text-xs text-muted-foreground mt-1">{sub}</span>
      </div>
    </div>
  );
};

const HarvestTimer = () => {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [sprayDate, setSprayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [overridePhi, setOverridePhi] = useState<string>("");

  // Maturity predictor state
  const [maturityCrop, setMaturityCrop] = useState<string>("Cotton");
  const [maturityVariety, setMaturityVariety] = useState<string>("");
  const [sowingDate, setSowingDate] = useState<string>("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, category, slug")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setProducts((data ?? []) as ProductLite[]));
  }, []);

  const selected = products.find((p) => p.id === productId);

  const phiInfo = useMemo(() => {
    if (!selected) return null;
    return PHI_LIBRARY.find((p) => p.productName.toLowerCase() === selected.name.toLowerCase()) ?? null;
  }, [selected]);

  const phi = useMemo(() => {
    if (overridePhi) return Number(overridePhi);
    if (phiInfo) return phiInfo.phiDays;
    if (!selected) return null;
    return DEFAULT_PHI_BY_CATEGORY[selected.category] ?? 14;
  }, [overridePhi, selected, phiInfo]);

  const safeDate = useMemo(() => {
    if (!sprayDate || phi == null) return null;
    const d = new Date(sprayDate);
    d.setDate(d.getDate() + phi);
    return d;
  }, [sprayDate, phi]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isSafe = safeDate ? today >= safeDate : false;
  const totalMs = safeDate && sprayDate ? safeDate.getTime() - new Date(sprayDate).getTime() : 0;
  const elapsedMs = safeDate && sprayDate ? today.getTime() - new Date(sprayDate).getTime() : 0;
  const percent = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;
  const daysLeft = safeDate ? Math.max(0, Math.ceil((safeDate.getTime() - today.getTime()) / 86400000)) : 0;

  const showGreenAlt = phi != null && phi >= 14 && phiInfo?.greenAlternative;

  // Maturity predictor
  const varietyOptions = CROP_MATURITY.filter((c) => c.crop === maturityCrop);
  const variety = varietyOptions.find((v) => v.variety === maturityVariety) ?? varietyOptions[0];
  const harvestWindow = useMemo(() => {
    if (!sowingDate || !variety) return null;
    const start = new Date(sowingDate);
    const min = new Date(start);
    min.setDate(min.getDate() + variety.minDays);
    const max = new Date(start);
    max.setDate(max.getDate() + variety.maxDays);
    return { min, max };
  }, [sowingDate, variety]);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Harvest Timer (PHI)</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Spray-to-harvest countdown & maturity predictor for Maharashtra crops.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-8">
          {/* PHI Calculator */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Spray-to-Harvest Countdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phi-product">Product Used</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger id="phi-product"><SelectValue placeholder="Select product (e.g. Jaguar)" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phi-date">Last Spray Date</Label>
                  <Input
                    id="phi-date"
                    type="date"
                    value={sprayDate}
                    onChange={(e) => setSprayDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phi-override">Custom PHI (days)</Label>
                  <Input
                    id="phi-override"
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Use product default"
                    value={overridePhi}
                    onChange={(e) => setOverridePhi(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Override only if your product label specifies a different PHI.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={isSafe ? "border-primary" : "border-destructive/40"}>
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" /> Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!safeDate ? (
                  <p className="text-sm text-muted-foreground">Choose a product and spray date to calculate.</p>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <ProgressRing
                        percent={percent}
                        label={isSafe ? "Safe" : `${daysLeft}d`}
                        sub={isSafe ? "to harvest" : "remaining"}
                        danger={!isSafe}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-md bg-muted p-2">
                        <div className="text-muted-foreground">PHI</div>
                        <div className="font-semibold">{phi} days</div>
                      </div>
                      <div className="rounded-md bg-muted p-2">
                        <div className="text-muted-foreground">Safe from</div>
                        <div className="font-semibold">{fmtDate(safeDate)}</div>
                      </div>
                    </div>

                    {isSafe ? (
                      <div className="flex items-start gap-2 p-3 rounded-md bg-primary/10 text-primary text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Your crop is safe to harvest.</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          Harvesting before <strong>{fmtDate(safeDate)}</strong> may leave chemical residues.
                          This can lead to market rejection.
                        </span>
                      </div>
                    )}

                    {showGreenAlt && (
                      <div className="flex items-start gap-2 p-3 rounded-md bg-accent/15 text-sm border border-accent/30">
                        <Leaf className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        <div>
                          <div className="font-semibold">Greener late-season option</div>
                          <div className="text-muted-foreground text-xs">
                            For shorter PHI, try <strong>{phiInfo?.greenAlternative}</strong> from our bio range.
                          </div>
                          <Button asChild variant="link" size="sm" className="px-0 h-auto mt-1">
                            <Link to="/products">Browse bio products →</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  Always confirm PHI on the official product label. This tool provides general guidance only.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maturity Predictor */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" /> Maturity Predictor
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Crop</Label>
                <Select value={maturityCrop} onValueChange={(v) => { setMaturityCrop(v); setMaturityVariety(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(CROP_MATURITY.map((c) => c.crop))).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <Select value={variety?.variety ?? ""} onValueChange={setMaturityVariety}>
                  <SelectTrigger><SelectValue placeholder="Select variety" /></SelectTrigger>
                  <SelectContent>
                    {varietyOptions.map((v) => (
                      <SelectItem key={v.variety} value={v.variety}>{v.variety}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sow-date">Sowing Date</Label>
                <Input id="sow-date" type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} />
              </div>
              <div className="flex flex-col justify-end">
                {harvestWindow ? (
                  <div className="rounded-md bg-primary/10 p-3 text-sm">
                    <div className="text-xs text-muted-foreground">Estimated Harvest Window</div>
                    <div className="font-heading font-bold text-primary">
                      {fmtDate(harvestWindow.min)}
                    </div>
                    <div className="text-xs text-muted-foreground">to {fmtDate(harvestWindow.max)}</div>
                  </div>
                ) : (
                  <Badge variant="outline" className="self-start">Enter sowing date</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default HarvestTimer;