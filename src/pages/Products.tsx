import Layout from "@/components/layout/Layout";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Bug, Droplets, Sprout } from "lucide-react";

const categories = [
  { name: "All Products", icon: Filter, count: 48 },
  { name: "Insecticides", icon: Bug, count: 15 },
  { name: "Fungicides", icon: Shield, count: 12 },
  { name: "Herbicides", icon: Droplets, count: 10 },
  { name: "Plant Growth Regulators", icon: Sprout, count: 11 },
];

const sampleProducts = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: categories[1 + (i % 4)].name,
  description: "Advanced crop protection formulation for effective pest control and enhanced yield.",
}));

const Products = () => {
  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Our Products</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Comprehensive range of crop protection solutions for every farming need.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <h3 className="font-heading font-semibold text-foreground mb-4">Categories</h3>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-primary/5 hover:text-primary transition-colors text-left">
                      <span className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{cat.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleProducts.map((product) => (
                  <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-elevated transition-all group">
                    <div className="h-40 bg-muted flex items-center justify-center">
                      <Shield className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mt-2 mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <Button variant="link" className="px-0 mt-2">View Details →</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
