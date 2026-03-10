import { useState } from "react";
import FarmerLayout from "@/components/farmer/FarmerLayout";
import { useProducts } from "@/hooks/use-db-products";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const commonCrops = ["Cotton", "Soybean", "Rice", "Wheat", "Chilli", "Tomato", "Onion", "Grapes", "Sugarcane", "Maize"];

const CropRecommendations = () => {
  const { data: products, isLoading } = useProducts();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [customCrop, setCustomCrop] = useState("");

  const cropQuery = selectedCrop || customCrop;

  const recommended = (products ?? []).filter((p) => {
    if (!cropQuery) return false;
    return (p.targetCrops ?? []).some((c) =>
      c.toLowerCase().includes(cropQuery.toLowerCase())
    );
  });

  return (
    <FarmerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Crop-wise Recommendations</h1>
        <p className="text-muted-foreground mb-6">Select your crop to find the right pesticide / PGR</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {commonCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => { setSelectedCrop(crop); setCustomCrop(""); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedCrop === crop ? "bg-green-700 text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
            >
              <Sprout className="h-3 w-3 inline mr-1" />{crop}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Or type your crop name..."
            value={customCrop}
            onChange={(e) => { setCustomCrop(e.target.value); setSelectedCrop(""); }}
            className="pl-9"
          />
        </div>

        {!cropQuery ? (
          <div className="text-center py-12 text-muted-foreground">
            <Sprout className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a crop above to see recommendations</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : recommended.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found for "{cropQuery}". Try another crop or <Link to="/farmer/questions" className="text-green-700 underline">ask our experts</Link>.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Showing {recommended.length} product(s) for <strong>{cropQuery}</strong></p>
            <div className="grid sm:grid-cols-2 gap-4">
              {recommended.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    {p.image && <img src={p.image} alt={p.name} className="h-16 w-16 object-contain rounded bg-muted/30 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold group-hover:text-green-700">{p.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{p.categoryLabel}</Badge>
                      {p.dosage && <p className="text-xs text-green-700 mt-1">Dosage: {p.dosage}</p>}
                      {p.targetPests && p.targetPests.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Targets: {p.targetPests.slice(0, 3).join(", ")}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </FarmerLayout>
  );
};

export default CropRecommendations;
