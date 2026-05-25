import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Video, FileText, Clock, User, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useResources } from "@/hooks/use-resources";

const categoryLabels: Record<string, string> = {
  "crop-protection": "Crop Protection",
  "application": "Application Techniques",
  "safety": "Safety & Compliance",
  "ipm": "IPM",
  "seasonal": "Seasonal Care",
  "soil-health": "Soil Health",
  "sustainability": "Sustainability",
  "rnd": "R&D",
};
const labelFor = (c: string) => categoryLabels[c] ?? c;

const typeIcons: Record<string, typeof BookOpen> = { article: BookOpen, video: Video, guide: FileText };

const Resources = () => {
  const { data: articles = [], isLoading } = useResources();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    let result = [...articles];
    if (category !== "all") result = result.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, category, articles]);

  const featured = articles.filter((a) => a.featured);
  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category))), [articles]);

  return (
    <Layout>
      <SEO
        title="Knowledge Base — Farming Resources & Guides"
        description="Expert articles, guides and videos on crop protection, application techniques, IPM, soil health, and pesticide safety."
        path="/resources"
      />
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Knowledge Base</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Expert resources, guides, and tips to help you get the most from your crops.
          </p>
          <div className="max-w-xl mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles, guides, tips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base bg-card"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      {category === "all" && !search && (
        <section className="py-10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((article) => {
                const Icon = typeIcons[article.type] ?? BookOpen;
                return (
                  <Link
                    key={article.id}
                    to={`/resources/${article.slug}`}
                    className="group bg-card rounded-xl border border-border p-6 hover:shadow-elevated hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary">{labelFor(article.category)}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Category filter chips */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Topics
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

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => {
                const Icon = typeIcons[article.type] ?? BookOpen;
                const isBookmarked = bookmarks.includes(article.id);
                return (
                  <div key={article.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-elevated transition-all group">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                            {labelFor(article.category)}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>
                      <Link to={`/resources/${article.slug}`}>
                        <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
