import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getNewsBySlug, newsArticles, newsCategoryLabels } from "@/data/content";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { toast } from "sonner";

const NewsDetail = () => {
  const { slug } = useParams();
  const article = getNewsBySlug(slug || "");

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Link to="/news"><Button>Back to News</Button></Link>
        </div>
      </Layout>
    );
  }

  const related = newsArticles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <Layout>
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{article.title}</span>
          </div>
        </div>
      </div>

      <article className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Link>

          <div className="mb-8">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {newsCategoryLabels[article.category]}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{article.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{article.date}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {article.content.map((paragraph, i) => {
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
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-10 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6">More News</h2>
            <div className="space-y-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/news/${r.slug}`}
                  className="block bg-card rounded-xl border border-border p-5 hover:shadow-card transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary">{newsCategoryLabels[r.category]}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default NewsDetail;
