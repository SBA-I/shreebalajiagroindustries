import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, FileDown, Search, HardHat, Recycle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmergencyContactButton from "@/components/safety/EmergencyContactButton";

interface MsdsDoc {
  id: string;
  product_name: string;
  language: string;
  version: string | null;
  file_url: string;
  file_size_kb: number | null;
}

const ppeChart = [
  { category: "Insecticides", items: ["Nitrile gloves", "N95 respirator", "Goggles", "Long-sleeve coverall", "Rubber boots"] },
  { category: "Fungicides", items: ["Nitrile gloves", "Dust mask", "Goggles", "Long-sleeve shirt", "Closed shoes"] },
  { category: "Herbicides", items: ["Chemical-resistant gloves", "Face shield", "Coverall", "Rubber boots"] },
  { category: "PGR", items: ["Nitrile gloves", "Goggles", "Long-sleeve shirt"] },
];

const disposalSteps = [
  { title: "Triple-rinse", body: "Empty container, rinse three times with clean water and pour the rinsate into the spray tank." },
  { title: "Puncture", body: "Puncture rinsed plastic containers so they cannot be reused for food, water or fodder." },
  { title: "Crush & store", body: "Crush containers and store in a dry, secure location away from children and animals." },
  { title: "Hand over", body: "Hand crushed containers to your authorised dealer's collection drive — never burn or bury them." },
];

const SafetyHub = () => {
  const [docs, setDocs] = useState<MsdsDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("msds_documents")
      .select("id, product_name, language, version, file_url, file_size_kb")
      .eq("is_active", true)
      .order("product_name")
      .then(({ data }) => {
        setDocs(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = docs.filter((d) => d.product_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 text-primary-foreground">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Safety & Compliance Hub</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                MSDS library, PPE guidance and safe-disposal protocols for every Balaji product.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <Tabs defaultValue="msds">
            <TabsList className="grid grid-cols-3 w-full max-w-xl mb-6">
              <TabsTrigger value="msds" className="gap-1.5"><FileDown className="h-4 w-4" /> MSDS</TabsTrigger>
              <TabsTrigger value="ppe" className="gap-1.5"><HardHat className="h-4 w-4" /> PPE</TabsTrigger>
              <TabsTrigger value="disposal" className="gap-1.5"><Recycle className="h-4 w-4" /> Disposal</TabsTrigger>
            </TabsList>

            {/* MSDS */}
            <TabsContent value="msds">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Material Safety Data Sheets</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download the official MSDS for any Balaji product. Sheets are reviewed and re-issued every 12 months.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by product (e.g. Jaquar, Phantom)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-muted-foreground/60" />
                      {docs.length === 0
                        ? "MSDS library is being prepared. Check back soon or contact us for a specific sheet."
                        : "No MSDS found for that product."}
                    </div>
                  ) : (
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                      {filtered.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                          <div>
                            <p className="font-medium text-sm">{doc.product_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] uppercase">{doc.language}</Badge>
                              {doc.version && <span className="text-xs text-muted-foreground">v{doc.version}</span>}
                              {doc.file_size_kb && <span className="text-xs text-muted-foreground">{doc.file_size_kb} KB</span>}
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline" className="gap-1.5">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <FileDown className="h-3.5 w-3.5" /> Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PPE */}
            <TabsContent value="ppe">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Personal Protective Equipment</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Always wear the recommended PPE before mixing or spraying any agro-chemical product.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {ppeChart.map((cat) => (
                    <div key={cat.category} className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <HardHat className="h-5 w-5 text-primary" />
                        <h3 className="font-heading font-semibold">{cat.category}</h3>
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        {cat.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Disposal */}
            <TabsContent value="disposal">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Safe Container Disposal</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Empty containers are hazardous waste. Follow these four steps to protect soil, water and your community.
                  </p>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {disposalSteps.map((step, idx) => (
                      <li key={step.title} className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-sm">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{step.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 p-3 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Never burn pesticide containers or use them to store food, water or fodder.</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <EmergencyContactButton />
    </Layout>
  );
};

export default SafetyHub;