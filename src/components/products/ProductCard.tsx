import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useComparison } from "@/hooks/use-product-comparison";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { add, remove, isInComparison } = useComparison();
  const comparing = isInComparison(product.id);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-elevated transition-all group flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        <div className="h-48 bg-muted flex items-center justify-center p-4 relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <span className="absolute top-3 right-3 text-xs font-bold bg-accent text-accent-foreground px-2.5 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-2">
          {product.categoryLabel}
        </span>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{product.tagline}</p>
        <div className="text-xs text-muted-foreground mb-3">
          <span className="font-medium text-foreground">Composition:</span> {product.composition}
        </div>
        <div className="flex gap-2 mt-auto">
          <Link to={`/products/${product.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">View Details</Button>
          </Link>
          <Button
            variant={comparing ? "secondary" : "outline"}
            size="sm"
            onClick={() => comparing ? remove(product.id) : add(product)}
            title={comparing ? "Remove from comparison" : "Add to comparison"}
          >
            {comparing ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
