import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Loader2, ArrowRight, Sprout, FlaskConical, Mountain } from "lucide-react";
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

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
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