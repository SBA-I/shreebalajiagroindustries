import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Loader2, ArrowRight, Sprout, FlaskConical, Mountain, Bug, Bird, Sun, Recycle, Target, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  hero_image_url: string | null;
  category: string;
  published_at: string;
}

const CATS = [
  { value: "all", label: "All", icon: Leaf },
  { value: "ipm", label: "IPM", icon: Sprout },
  { value: "soil", label: "Soil Health", icon: Mountain },
  { value: "rnd", label: "R&D", icon: FlaskConical },
  { value: "sustainability", label: "Sustainability", icon: Leaf },
];

const Sustainability = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");

  useEffect(() => {
    supabase
      .from("sustainability_articles")
      .select("id, slug, title, excerpt, hero_image_url, category, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setArticles((data ?? []) as Article[]);
        setLoading(false);
      });
  }, []);

  const visible = cat === "all" ? articles : articles.filter((a) => a.category === cat);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">Sustainability & R&D</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                Behind-the-scenes of how we build safer, smarter agro-chemical solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IPM Strategy */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Bug className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-bold">Integrated Pest Management (IPM)</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl mb-6">
            Balaji products are designed as the chemical pillar of a four-part IPM stack — used only when natural and cultural controls aren't enough.
          </p>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { title: "Cultural", body: "Crop rotation, resistant varieties, healthy spacing.", color: "bg-primary/10 text-primary" },
              { title: "Biological", body: "Conserve predators (ladybirds, spiders, lacewings).", color: "bg-secondary/10 text-secondary-foreground" },
              { title: "Mechanical", body: "Pheromone traps, hand-picking, light traps.", color: "bg-accent/10 text-accent-foreground" },
              { title: "Chemical", body: "Spray only when pest counts cross the action threshold.", color: "bg-destructive/10 text-destructive" },
            ].map((b) => (
              <Card key={b.title}>
                <CardContent className="p-4">
                  <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.color} mb-2`}>{b.title}</span>
                  <p className="text-sm text-foreground/80">{b.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="font-heading font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Pest Action Thresholds (Maharashtra)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Spray only if pest counts cross these levels — under threshold, beneficial insects will handle the load.</p>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              {[
                { crop: "Cotton", pest: "Pink Bollworm", th: "8 moths/trap/night for 3 nights" },
                { crop: "Soybean", pest: "Girdle Beetle", th: "1 beetle / metre row" },
                { crop: "Onion", pest: "Thrips", th: "30 thrips / plant" },
                { crop: "Tomato", pest: "Fruit Borer", th: "1 egg / plant or 5% damage" },
              ].map((r) => (
                <div key={r.crop} className="flex items-center justify-between gap-2 rounded-md bg-card border border-border p-2.5">
                  <div>
                    <p className="text-xs font-semibold">{r.crop} • {r.pest}</p>
                    <p className="text-[11px] text-muted-foreground">{r.th}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bee & Pollinator Safety */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Bird className="h-6 w-6 text-accent-foreground" />
            <h2 className="font-heading text-2xl font-bold">Bee & Pollinator Safety</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
            Every Balaji formulation is graded for pollinator safety. Apply at the right time of day to avoid harming bees that visit your crop.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { tag: "Bee-Safe", color: "bg-primary text-primary-foreground", products: "Most Fungicides, PGRs", time: "Any time of day" },
              { tag: "Use With Care", color: "bg-accent text-accent-foreground", products: "Selective Insecticides, Herbicides", time: "Apply after 5 PM, before 7 AM" },
              { tag: "Bee-Toxic", color: "bg-destructive text-destructive-foreground", products: "Broad-spectrum Insecticides", time: "Spray only at dusk; never during bloom" },
            ].map((b) => (
              <Card key={b.tag} className="overflow-hidden">
                <div className={`px-4 py-2 ${b.color} text-xs font-bold uppercase tracking-wide`}>{b.tag}</div>
                <CardContent className="p-4 space-y-1.5">
                  <p className="text-xs"><span className="font-medium text-muted-foreground">Products:</span> {b.products}</p>
                  <p className="text-xs flex items-center gap-1.5"><Sun className="h-3 w-3 text-accent-foreground" />{b.time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Soil Carbon Sponge */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mountain className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-2xl font-bold">Soil Carbon Sponge</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Healthy soil acts like a sponge — it stores water and locks away carbon. Every Balaji product is screened for impact on earthworms, mycorrhizae and rhizobacteria before launch.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Earthworm survival > 95% at label dose (OECD 207).",
                  "Soil microbial respiration restored within 28 days.",
                  "Zero residue carry-over to the next crop cycle (when label PHI is followed).",
                  "Promotes water holding capacity — every 1% organic matter = 75,000 L extra water/acre.",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-heading font-semibold text-sm mb-4">Carbon stored per acre per year</h3>
              <div className="space-y-3">
                {[
                  { name: "Conventional spraying", value: 28, color: "bg-muted-foreground/40" },
                  { name: "IPM + Balaji rotation", value: 62, color: "bg-accent" },
                  { name: "IPM + Balaji + cover crops", value: 92, color: "bg-primary" },
                ].map((row) => (
                  <div key={row.name}>
                    <div className="flex justify-between text-xs mb-1"><span>{row.name}</span><span className="font-semibold">{row.value} kg CO₂e</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${row.color}`} style={{ width: `${row.value}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 italic">Indicative figures; based on ICAR field trials, 2024.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Roadmap */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Recycle className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-bold">Roadmap to 2030</h2>
          </div>
          <ol className="relative border-l-2 border-primary/30 ml-3 space-y-6">
            {[
              { year: "2026", title: "Bio-stimulant licence secured", body: "First Balaji bio-stimulant launched, reducing chemical load on partner farms by 18%.", done: true },
              { year: "2027", title: "Triple-Rinse collection drive", body: "100 dealer drop-points across Maharashtra for safe container recycling.", done: false },
              { year: "2028", title: "50% bio-degradable packaging", body: "Switch primary 1L packs to plant-based PLA bottles.", done: false },
              { year: "2029", title: "Carbon-neutral plant", body: "Solar + bio-gas covers 100% of factory power.", done: false },
              { year: "2030", title: "100% recyclable packaging", body: "Every label, cap and bottle in the Balaji range becomes recyclable.", done: false },
            ].map((m) => (
              <li key={m.year} className="ml-6">
                <span className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ${m.done ? "bg-primary text-primary-foreground" : "bg-card border-2 border-primary/40"}`}>
                  {m.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-primary/50" />}
                </span>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={m.done ? "default" : "outline"} className="text-[10px]">{m.year}</Badge>
                    <h3 className="font-heading font-semibold text-sm">{m.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" /> Knowledge Library
          </h2>
          <Tabs value={cat} onValueChange={setCat}>
            <TabsList className="mb-6 flex-wrap h-auto">
              {CATS.map((c) => {
                const Icon = c.icon;
                return (
                  <TabsTrigger key={c.value} value={c.value} className="gap-1.5">
                    <Icon className="h-3.5 w-3.5" /> {c.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : visible.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No articles in this category yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((a) => (
                <Link key={a.id} to={`/sustainability/${a.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-elevated transition-shadow group">
                    <div className="aspect-video bg-muted">
                      {a.hero_image_url ? (
                        <img src={a.hero_image_url} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <Leaf className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-[10px] uppercase mb-2">{a.category}</Badge>
                      <h3 className="font-heading font-semibold text-base group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      {a.excerpt && <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{a.excerpt}</p>}
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
                        Read article <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Sustainability;