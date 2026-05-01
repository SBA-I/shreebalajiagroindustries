import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle2, AlertTriangle, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductLite {
  id: string;
  name: string;
  category: string;
}

// Default PHI in days per category (used as fallback)
const DEFAULT_PHI: Record<string, number> = {
  insecticides: 14,
  fungicides: 10,
  herbicides: 21,
  pgr: 7,
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const HarvestTimer = () => {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [sprayDate, setSprayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [overridePhi, setOverridePhi] = useState<string>("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, category")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setProducts((data ?? []) as ProductLite[]));
  }, []);

  const selected = products.find((p) => p.id === productId);

  const phi = useMemo(() => {
    if (overridePhi) return Number(overridePhi);
    if (!selected) return null;
    return DEFAULT_PHI[selected.category] ?? 14;
  }, [overridePhi, selected]);

  const safeDate = useMemo(() => {
    if (!sprayDate || phi == null) return null;
    const d = new Date(sprayDate);
    d.setDate(d.getDate() + phi);
    return d;
  }, [sprayDate, phi]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isSafe = safeDate ? today >= safeDate : false;
  const daysLeft = safeDate ? Math.ceil((safeDate.getTime() - today.getTime()) / 86400000) : 0;

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Harvest Timer (PHI)</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Calculate the safe Pre-Harvest Interval after your last spray.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Spray Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phi-product">Product Used</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="phi-product"><SelectValue placeholder="Select product" /></SelectTrigger>
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

          <Card className={isSafe ? "border-primary" : "border-accent"}>
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" /> Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!safeDate ? (
                <p className="text-sm text-muted-foreground">Choose a product and spray date to calculate.</p>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground">PHI applied</div>
                  <Badge variant="outline" className="text-base font-semibold">{phi} days</Badge>

                  <div className="text-xs text-muted-foreground mt-3">Safe to harvest from</div>
                  <p className="text-xl font-heading font-bold text-primary">{fmtDate(safeDate)}</p>

                  {isSafe ? (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-primary/10 text-primary text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Your crop is safe to harvest.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-accent/20 text-accent-foreground text-sm">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Wait <strong>{daysLeft}</strong> more day{daysLeft === 1 ? "" : "s"} before harvesting.</span>
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
      </section>
    </Layout>
  );
};

export default HarvestTimer;