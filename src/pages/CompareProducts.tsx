import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/hooks/use-product-comparison";
import { Product } from "@/types/product";
import { ArrowLeft } from "lucide-react";

const CompareProducts = () => {
  const { items: products } = useComparison();

  if (products.length < 2) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Select at least 2 products to compare</h1>
          <Link to="/products"><Button>Browse Products</Button></Link>
        </div>
      </Layout>
    );
  }

  const rows: { label: string; getValue: (p: Product) => string }[] = [
    { label: "Category", getValue: (p) => p.categoryLabel },
    { label: "Composition", getValue: (p) => p.composition },
    { label: "Formulation", getValue: (p) => p.formulation },
    { label: "Dosage", getValue: (p) => p.dosage },
    { label: "Mode of Action", getValue: (p) => p.modeOfAction },
    { label: "Target Crops", getValue: (p) => p.targetCrops.join(", ") },
    { label: "Target Pests", getValue: (p) => p.targetPests.length > 0 ? p.targetPests.join(", ") : "N/A" },
    { label: "Pack Sizes", getValue: (p) => p.packSizes.join(", ") },
    { label: "Key Features", getValue: (p) => p.features.join(" • ") },
    { label: "Price", getValue: (p) => p.price ? `₹${p.price.toLocaleString()}` : "Contact us" },
  ];

  return (
    <Layout>
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>
      </div>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Compare Products</h1>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-48 p-4 text-left text-sm font-medium text-muted-foreground bg-muted rounded-tl-xl">Specification</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 bg-muted text-center last:rounded-tr-xl">
                      <div className="flex flex-col items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-20 object-contain" />
                        <Link to={`/products/${p.id}`} className="font-heading font-semibold text-foreground hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.categoryLabel}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <td className="p-4 text-sm font-medium text-foreground border-r border-border">{row.label}</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-sm text-muted-foreground text-center">{row.getValue(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompareProducts;
