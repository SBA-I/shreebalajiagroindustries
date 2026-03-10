import { useState } from "react";
import FarmerLayout from "@/components/farmer/FarmerLayout";
import { useProducts } from "@/hooks/use-db-products";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["All", "Insecticides", "Fungicides", "Herbicides", "PGR"];

const FarmerProducts = () => {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = (products ?? []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.composition.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <FarmerLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Our Products</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${category === c ? "bg-green-700 text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No products found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
              >
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-contain rounded-lg mb-3 bg-muted/30" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading font-semibold text-foreground group-hover:text-green-700">{product.name}</p>
                    {product.technicalName && <p className="text-xs text-muted-foreground">{product.technicalName}</p>}
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">{product.category}</Badge>
                </div>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.shortDescription}</p>
                )}
                {product.dosage && (
                  <p className="text-xs text-green-700 mt-2 font-medium">Dosage: {product.dosage}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
};

export default FarmerProducts;
