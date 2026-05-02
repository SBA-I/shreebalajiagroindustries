import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Loader2, Store, Navigation, MessageCircle, LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dealer {
  id: string;
  name: string;
  address_line: string;
  city: string;
  district: string | null;
  taluka: string | null;
  state: string;
  pincode: string;
  is_authorized: boolean;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  whatsapp: string | null;
  distance_km?: number | null;
}

interface TalukaRow { taluka: string; district: string; state: string; dealer_count: number }

interface StockBadge {
  product_id: string;
  product_name: string;
  status: string;
  arriving_on: string | null;
  pack_size: string | null;
  quantity_available: number | null;
  price: number | null;
}

const STATUS_TONE: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-rose-100 text-rose-800",
  arriving: "bg-blue-100 text-blue-800",
};
const STATUS_LABEL: Record<string, string> = {
  in_stock: "In Stock",
  low_stock: "Low",
  out_of_stock: "Out",
  arriving: "Arriving",
};

const DealerLocator = () => {
  const [pincode, setPincode] = useState("");
  const [results, setResults] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [talukas, setTalukas] = useState<TalukaRow[]>([]);
  const [selectedTaluka, setSelectedTaluka] = useState<string>("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [stockByDealer, setStockByDealer] = useState<Record<string, StockBadge[]>>({});

  const loadStock = async (dealerIds: string[]) => {
    if (dealerIds.length === 0) { setStockByDealer({}); return; }
    const [{ data: stock }, { data: prods }] = await Promise.all([
      supabase.from("dealer_stock").select("dealer_id, product_id, status, arriving_on, pack_size, quantity_available, price").in("dealer_id", dealerIds),
      supabase.from("products").select("id, name").eq("is_active", true),
    ]);
    const nameMap: Record<string, string> = {};
    (prods ?? []).forEach((p: any) => { nameMap[p.id] = p.name; });
    const grouped: Record<string, StockBadge[]> = {};
    (stock ?? []).forEach((s: any) => {
      const list = grouped[s.dealer_id] ?? (grouped[s.dealer_id] = []);
      list.push({
        product_id: s.product_id,
        product_name: nameMap[s.product_id] ?? "Product",
        status: s.status,
        arriving_on: s.arriving_on,
        pack_size: s.pack_size ?? null,
        quantity_available: s.quantity_available ?? null,
        price: s.price ?? null,
      });
    });
    setStockByDealer(grouped);
  };

  useEffect(() => {
    loadStock(results.map((r) => r.id));
  }, [results]);

  useEffect(() => {
    supabase.rpc("list_dealer_talukas_public").then(({ data }) => {
      setTalukas((data ?? []) as TalukaRow[]);
    });
  }, []);

  const search = async () => {
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error("Enter a valid 6-digit Indian pincode");
      return;
    }
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase.rpc("search_dealers_public", {
      _pincode: trimmed,
    });
    if (error) {
      toast.error("Could not search dealers. Please try again.");
      setResults([]);
    } else {
      setResults((data ?? []) as Dealer[]);
    }
    setLoading(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported on this device");
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { data, error } = await supabase.rpc("nearest_dealers_public", {
          _lat: latitude, _lng: longitude, _limit: 5,
        });
        setGeoBusy(false);
        setSearched(true);
        if (error) { toast.error("Could not load nearby dealers"); setResults([]); return; }
        setResults((data ?? []) as Dealer[]);
      },
      (err) => {
        setGeoBusy(false);
        toast.error(err.code === err.PERMISSION_DENIED ? "Please allow location access" : "Could not detect location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filterByTaluka = async (taluka: string) => {
    setSelectedTaluka(taluka);
    if (!taluka) return;
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from("dealers")
      .select("id,name,address_line,city,district,taluka,state,pincode,is_authorized,lat,lng,photo_url,whatsapp")
      .eq("is_active", true)
      .eq("taluka", taluka)
      .order("city");
    setLoading(false);
    if (error) { toast.error("Could not load dealers"); setResults([]); return; }
    setResults((data ?? []) as Dealer[]);
  };

  const mapsHref = (d: Dealer) =>
    d.lat != null && d.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name}, ${d.address_line}, ${d.city}, ${d.state} ${d.pincode}`)}`;

  const waHref = (d: Dealer) => {
    const num = (d.whatsapp ?? "").replace(/\D/g, "");
    if (!num) return null;
    const full = num.length === 10 ? `91${num}` : num;
    return (productName?: string) => {
      const text = productName
        ? `Hello ${d.name}, I saw on the Shree Balaji Agro website that you have ${productName} in stock. Can you set aside 2 litres for me?`
        : `Namaste, I would like to check stock availability of Shree Balaji Agro products at ${d.name}.`;
      return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
    };
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Find an Authorized Dealer</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Auto-detect your location, search by pincode, or filter by taluka to find the nearest Balaji krishi kendra.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 grid gap-3 md:grid-cols-2">
              <Button onClick={useMyLocation} disabled={geoBusy} className="gap-1.5">
                {geoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                Use my current location
              </Button>
              <Select value={selectedTaluka} onValueChange={filterByTaluka}>
                <SelectTrigger><SelectValue placeholder="Filter by taluka" /></SelectTrigger>
                <SelectContent>
                  {talukas.length === 0 ? (
                    <SelectItem value="__none" disabled>No talukas yet</SelectItem>
                  ) : talukas.map((t) => (
                    <SelectItem key={`${t.taluka}-${t.district}`} value={t.taluka}>
                      {t.taluka} {t.district ? `· ${t.district}` : ""} ({t.dealer_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Search by Pincode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => { e.preventDefault(); setSelectedTaluka(""); search(); }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 424001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                />
                <Button type="submit" disabled={loading} className="gap-1.5">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </form>

              {searched && !loading && (
                <div className="mt-6">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground/60" />
                      No authorised dealers found. Please contact our helpdesk for assistance.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {results.length} dealer{results.length === 1 ? "" : "s"} found
                      </p>
                      {results.map((d) => (
                        <DealerCard
                          key={d.id}
                          dealer={d}
                          mapsHref={mapsHref(d)}
                          waBuilder={waHref(d) as any}
                          stock={stockByDealer[d.id] ?? []}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

const DealerCard = ({
  dealer, mapsHref, waBuilder, stock,
}: {
  dealer: Dealer;
  mapsHref: string;
  waBuilder: ((productName?: string) => string) | null;
  stock: StockBadge[];
}) => (
  <div className="rounded-lg border border-border p-4 hover:border-primary transition-colors">
    <div className="flex gap-3">
      {dealer.photo_url && (
        <img src={dealer.photo_url} alt={`${dealer.name} shop`} loading="lazy"
             className="h-20 w-20 rounded-md object-cover border border-border shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading font-semibold">{dealer.name}</h3>
          <div className="flex items-center gap-1.5">
            {dealer.distance_km != null && (
              <Badge variant="outline" className="text-xs">{dealer.distance_km} km</Badge>
            )}
            {dealer.is_authorized && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Authorised</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            {dealer.address_line}, {dealer.city}
            {dealer.taluka && `, ${dealer.taluka}`}
            {dealer.district && `, ${dealer.district}`}, {dealer.state} – {dealer.pincode}
          </span>
        </p>
      </div>
    </div>

    {stock.length > 0 && (
      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Available stock</p>
        <div className="space-y-1.5">
          {stock.map((s) => {
            const label = STATUS_LABEL[s.status] ?? s.status;
            const tone = STATUS_TONE[s.status] ?? "bg-muted text-muted-foreground";
            const meta: string[] = [];
            if (s.pack_size) meta.push(s.pack_size);
            if (s.quantity_available != null) meta.push(`${s.quantity_available} packs left`);
            if (s.price != null) meta.push(`₹${s.price}`);
            if (s.status === "arriving" && s.arriving_on) {
              meta.push(`Arrives ${new Date(s.arriving_on).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}`);
            }
            const inner = (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{s.product_name}</p>
                  {meta.length > 0 && (
                    <p className="text-[11px] text-muted-foreground truncate">{meta.join(" · ")}</p>
                  )}
                </div>
                <Badge className={`${tone} text-[10px] shrink-0`}>{label}</Badge>
              </div>
            );
            return waBuilder ? (
              <a key={s.product_id} href={waBuilder(s.product_name)} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90">
                {inner}
              </a>
            ) : (
              <div key={s.product_id}>{inner}</div>
            );
          })}
        </div>
      </div>
    )}

    <div className="mt-3 flex flex-wrap gap-2">
      <Button asChild size="sm" className="gap-1.5">
        <a href={mapsHref} target="_blank" rel="noopener noreferrer">
          <Navigation className="h-3.5 w-3.5" /> Navigate
        </a>
      </Button>
      {waBuilder ? (
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <a href={waBuilder()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" /> Check Stock on WhatsApp
          </a>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled className="gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp unavailable
        </Button>
      )}
    </div>
  </div>
);

export default DealerLocator;