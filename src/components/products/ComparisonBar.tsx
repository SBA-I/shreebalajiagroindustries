import { X, GitCompareArrows, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/hooks/use-product-comparison";
import { Link } from "react-router-dom";

const ComparisonBar = () => {
  const { items, remove, clear } = useComparison();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <GitCompareArrows className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground shrink-0">Compare ({items.length}/4):</span>
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1 shrink-0">
              <span className="text-xs font-medium text-foreground">{p.name}</span>
              <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
          {items.length >= 2 && (
            <Link to={`/products/compare?ids=${items.map((p) => p.id).join(",")}`}>
              <Button size="sm" className="gap-1">
                <GitCompareArrows className="h-4 w-4" /> Compare Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
