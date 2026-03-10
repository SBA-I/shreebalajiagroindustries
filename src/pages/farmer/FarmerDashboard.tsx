import FarmerLayout from "@/components/farmer/FarmerLayout";
import { Link } from "react-router-dom";
import { ShoppingBag, Sprout, MapPin, MessageSquare, FileText, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickLinks = [
  { label: "Browse Products", icon: ShoppingBag, path: "/farmer/products", color: "bg-blue-100 text-blue-700", desc: "View all pesticides & solutions" },
  { label: "Crop Recommendations", icon: Sprout, path: "/farmer/recommendations", color: "bg-green-100 text-green-700", desc: "Find the right product for your crop" },
  { label: "Find Nearest Dealer", icon: MapPin, path: "/farmer/dealers", color: "bg-orange-100 text-orange-700", desc: "Locate authorized dealers near you" },
  { label: "Ask a Question", icon: MessageSquare, path: "/farmer/questions", color: "bg-purple-100 text-purple-700", desc: "Get expert help for crop problems" },
  { label: "Usage Guides", icon: FileText, path: "/farmer/guides", color: "bg-teal-100 text-teal-700", desc: "Download product usage instructions" },
];

const FarmerDashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["farmer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <FarmerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
          Namaste, {profile?.full_name || "Farmer"} 🌾
        </h1>
        <p className="text-muted-foreground mb-8">What would you like to do today?</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group p-5 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className={`h-10 w-10 rounded-lg ${link.color} flex items-center justify-center mb-3`}>
                <link.icon className="h-5 w-5" />
              </div>
              <p className="font-heading font-semibold text-foreground group-hover:text-green-700 transition-colors">{link.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </FarmerLayout>
  );
};

export default FarmerDashboard;
