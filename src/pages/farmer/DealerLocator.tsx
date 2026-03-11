import FarmerLayout from "@/components/farmer/FarmerLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Building2, Loader2 } from "lucide-react";

const DealerLocator = () => {
  const { data: dealers, isLoading } = useQuery({
    queryKey: ["dealer-profiles"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_dealer_profiles");
      return (data ?? []) as any[];
    },
  });

  return (
    <FarmerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Find Nearest Dealer</h1>
        <p className="text-muted-foreground mb-6">Locate authorized Shree Balaji Agro dealers near you</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : !dealers || dealers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No dealers found yet. Please check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {dealers.map((d) => (
              <div key={d.id} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-orange-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-foreground">{d.company_name || d.full_name || "Dealer"}</p>
                    {d.territory && <p className="text-sm text-muted-foreground">Territory: {d.territory}</p>}
                    {(d.city || d.state) && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {[d.address, d.city, d.state, d.pincode].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {d.phone && (
                      <a href={`tel:${d.phone}`} className="text-sm text-green-700 font-medium flex items-center gap-1 mt-2 hover:underline">
                        <Phone className="h-3 w-3" />
                        {d.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
};

export default DealerLocator;
