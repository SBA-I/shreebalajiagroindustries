import Layout from "@/components/layout/Layout";
import { BookOpen, Video, Lightbulb } from "lucide-react";

const resources = [
  { title: "Crop Protection Guide", desc: "Complete guide to choosing the right pesticide for your crops.", icon: BookOpen, category: "Guide" },
  { title: "Safe Application Practices", desc: "Learn how to apply agrochemicals safely and effectively.", icon: Lightbulb, category: "Safety" },
  { title: "Seasonal Pest Calendar", desc: "Know which pests to expect and when to take preventive action.", icon: BookOpen, category: "Reference" },
  { title: "Spraying Techniques Tutorial", desc: "Video tutorial on optimal spraying methods for maximum coverage.", icon: Video, category: "Video" },
  { title: "Integrated Pest Management", desc: "Combining biological and chemical methods for sustainable farming.", icon: Lightbulb, category: "Guide" },
  { title: "Soil Health & Fertilization", desc: "Understanding soil health for better crop protection outcomes.", icon: BookOpen, category: "Guide" },
];

const Resources = () => {
  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Knowledge Base</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Expert resources, guides, and tips to help you get the most from your crops.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <div key={r.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{r.category}</span>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
