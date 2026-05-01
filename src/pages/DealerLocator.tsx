import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Phone, Mail, Loader2, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Dealer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string;
  email: string | null;
  address_line: string;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  is_authorized: boolean;
}

const DealerLocator = () => {
  const [pincode, setPincode] = useState("");
  const [results, setResults] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error("Enter a valid 6-digit Indian pincode");
      return;
    }
    setLoading(true);
    setSearched(true);
    const prefix = trimmed.slice(0, 3);
    // Exact match first; if none, fall back to nearby (same prefix)
    const { data: exact } = await supabase
      .from("dealers")
      .select("*")
      .eq("is_active", true)
      .eq("pincode", trimmed);
    if (exact && exact.length > 0) {
      setResults(exact as Dealer[]);
    } else {
      const { data: nearby } = await supabase
        .from("dealers")
        .select("*")
        .eq("is_active", true)
        .like("pincode", `${prefix}%`)
        .limit(10);
      setResults((nearby ?? []) as Dealer[]);
    }
    setLoading(false);
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
                Enter your pincode to find the nearest Balaji-authorised krishi kendra.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Search by Pincode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => { e.preventDefault(); search(); }}
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
                      No authorised dealers found near {pincode}. Please contact our helpdesk for assistance.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {results.length} dealer{results.length === 1 ? "" : "s"} found
                      </p>
                      {results.map((d) => (
                        <div key={d.id} className="rounded-lg border border-border p-4 hover:border-primary transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-heading font-semibold">{d.name}</h3>
                            {d.is_authorized && (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Authorised</Badge>
                            )}
                          </div>
                          {d.contact_person && (
                            <p className="text-xs text-muted-foreground mb-1">Contact: {d.contact_person}</p>
                          )}
                          <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>
                              {d.address_line}, {d.city}
                              {d.district && `, ${d.district}`}, {d.state} – {d.pincode}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <a href={`tel:${d.phone}`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                              <Phone className="h-3 w-3" /> {d.phone}
                            </a>
                            {d.email && (
                              <a href={`mailto:${d.email}`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                                <Mail className="h-3 w-3" /> {d.email}
                              </a>
                            )}
                          </div>
                        </div>
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

export default DealerLocator;