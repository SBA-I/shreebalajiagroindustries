import FarmerLayout from "@/components/farmer/FarmerLayout";
import { useProducts } from "@/hooks/use-db-products";
import { Loader2, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProductGuides = () => {
  const { data: products, isLoading } = useProducts();

  // Show products that have dosage or safety info as "guides"
  const withGuides = (products ?? []).filter(
    (p) => p.dosage || (p.safetyPrecautions && p.safetyPrecautions.length > 0)
  );

  return (
    <FarmerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Product Usage Guides</h1>
        <p className="text-muted-foreground mb-6">Dosage instructions and safety precautions for all products</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : withGuides.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No guides available yet.</p>
        ) : (
          <div className="space-y-3">
            {withGuides.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-teal-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-foreground group-hover:text-green-700">{p.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {p.dosage && <span>📋 Dosage: {p.dosage}</span>}
                    {p.formulation && <span>🧪 {p.formulation}</span>}
                    {p.safetyPrecautions && <span>⚠️ {p.safetyPrecautions.length} safety tips</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
};

export default ProductGuides;
