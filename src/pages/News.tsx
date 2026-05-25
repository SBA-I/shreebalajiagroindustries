import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNews } from "@/hooks/use-news";

const newsCategoryLabels: Record<string, string> = {
  company: "Company News",
  product: "Product Launch",
  industry: "Industry Update",
  advisory: "Advisory",
  achievement: "Achievement",
};
const labelFor = (c: string) => newsCategoryLabels[c] ?? c;

const News = () => {
  const { data: newsArticles = [], isLoading } = useNews();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [email, setEmail] = useState("");

  const filtered = useMemo(() => {
    let result = [...newsArticles];
    if (category !== "all") result = result.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return result;
  }, [search, category, newsArticles]);

  const categories = useMemo(() => Array.from(new Set(newsArticles.map((a) => a.category))), [newsArticles]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed to newsletter!");
    setEmail("");
  };

  const latestArticle = newsArticles[0];

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">News & Updates</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Stay informed about our latest products, achievements, and industry insights.
          </p>
        </div>
      </section>

      {/* Featured latest */}
      {category === "all" && !search && latestArticle && (
        <section className="py-10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <Link
              to={`/news/${latestArticle.slug}`}
              className="group block bg-card rounded-2xl border border-border p-8 hover:shadow-elevated transition-all max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {labelFor(latestArticle.category)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {latestArticle.date}
                </span>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-auto">LATEST</span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                {latestArticle.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{latestArticle.excerpt}</p>
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                Read Full Article <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All News
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {labelFor(cat)}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Articles */}
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No news articles found.</p>
              ) : (
                filtered.map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="block bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {labelFor(article.category)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {article.date}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <span className="text-sm font-medium text-primary mt-3 inline-flex items-center gap-1">
                      Read More <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Newsletter */}
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="font-heading font-semibold text-secondary-foreground mb-2">Newsletter</h3>
                <p className="text-sm text-secondary-foreground/80 mb-4">Get the latest updates delivered to your inbox.</p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
                    required
                  />
                  <Button type="submit" variant="hero" className="w-full">Subscribe</Button>
                </form>
              </div>

              {/* Categories count */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => {
                    const count = newsArticles.filter((a) => a.category === cat).length;
                    return (
                      <li key={cat} className="flex items-center justify-between">
                        <button onClick={() => setCategory(cat)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {labelFor(cat)}
                        </button>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default News;
