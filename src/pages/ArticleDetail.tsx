import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Tag, BookOpen, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useResources, useResourceBySlug } from "@/hooks/use-resources";
import { useJsonLd } from "@/lib/useJsonLd";

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

const ArticleDetail = () => {
  const { slug } = useParams();
  const { data: article, isLoading } = useResourceBySlug(slug || "");
  const { data: allArticles = [] } = useResources();

  useJsonLd("ld-article", article ? {
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: (article as any).heroImageUrl,
    datePublished: (article as any).publishedAt || (article as any).published_at,
    author: { "@type": "Person", name: article.author || "Shree Balaji Agro Industries" },
    publisher: { "@type": "Organization", name: "Shree Balaji Agro Industries" },
  } : null);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Link to="/resources"><Button>Back to Knowledge Base</Button></Link>
        </div>
      </Layout>
    );
  }

  const related = allArticles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Layout>
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        path={`/resources/${article.slug}`}
        type="article"
        image={article.heroImageUrl || undefined}
        jsonLd={{
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          image: article.heroImageUrl || undefined,
          author: { "@type": "Person", name: article.author || "Editorial Team" },
          publisher: { "@type": "Organization", name: "Shree Balaji Agro Industries" },
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/resources" className="hover:text-primary transition-colors">Knowledge Base</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{article.title}</span>
          </div>
        </div>
      </div>

      <article className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Knowledge Base
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {categoryLabels[article.category] ?? article.category}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">{article.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{article.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{article.author}{article.authorRole ? `, ${article.authorRole}` : ""}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readTime}</span>
              <span>{article.date}</span>
              <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5">
            {article.content.map((paragraph, i) => {
              // Parse bold text
              const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className="text-foreground leading-relaxed">
                  {parts.map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                  })}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <span key={tag} className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-10 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="space-y-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/resources/${r.slug}`}
                  className="flex items-start gap-4 bg-card rounded-xl border border-border p-5 hover:shadow-card transition-all group"
                >
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{r.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ArticleDetail;
