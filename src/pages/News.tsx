import Layout from "@/components/layout/Layout";
import { Calendar } from "lucide-react";

const articles = [
  { title: "New Product Launch: Advanced Insecticide Formula", date: "March 5, 2026", category: "Product Launch", excerpt: "Introducing our latest broad-spectrum insecticide with enhanced efficacy and lower environmental impact." },
  { title: "Shree Balaji Expands Distribution Network to 5 New States", date: "February 20, 2026", category: "Company News", excerpt: "Our distribution reach now covers over 20 states, bringing quality crop protection closer to every farmer." },
  { title: "Kharif Season: Pest Management Advisory", date: "February 10, 2026", category: "Advisory", excerpt: "Expert recommendations for managing common pests during the upcoming Kharif cropping season." },
  { title: "Award for Best Quality Agrochemicals 2025", date: "January 28, 2026", category: "Achievement", excerpt: "Shree Balaji Agro Industries recognized for outstanding quality standards in agrochemical manufacturing." },
];

const News = () => {
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

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="space-y-6">
            {articles.map((a) => (
              <article key={a.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{a.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {a.date}
                  </span>
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{a.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{a.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default News;
