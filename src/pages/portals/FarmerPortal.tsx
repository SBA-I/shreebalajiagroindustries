import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Sprout, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import WeatherWidget from "@/components/farmer/WeatherWidget";
import CropTimeline from "@/components/farmer/CropTimeline";
import SprayLog from "@/components/farmer/SprayLog";
import DiseaseGallery from "@/components/farmer/DiseaseGallery";
import YieldCalculator from "@/components/farmer/YieldCalculator";
import ProfileCard from "@/components/farmer/ProfileCard";

interface ProfileLite {
  full_name: string | null;
  taluka: string | null;
  district: string | null;
  state: string | null;
  crops: string[] | null;
}

const FarmerPortal = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, taluka, district, state, crops")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as ProfileLite));
  }, [user]);

  const location = [profile?.taluka, profile?.district, profile?.state].filter(Boolean).join(", ");

  return (
    <Layout>
      <section className="bg-primary py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Sprout className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
                Welcome, {profile?.full_name?.split(" ")[0] || "Farmer"}!
              </h1>
              {(location || profile?.crops?.length) && (
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs md:text-sm text-primary-foreground/80">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {location}
                    </span>
                  )}
                  {profile?.crops?.length ? <span>· {profile.crops.join(", ")}</span> : null}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-4 md:space-y-6">
          {/* Profile (signup details, editable) */}
          <ProfileCard />

          {/* Top: Weather */}
          <div className="grid gap-4 md:grid-cols-2">
            <WeatherWidget />
            <YieldCalculator />
          </div>

          {/* Crop Timeline */}
          <CropTimeline />

          {/* Spray Log + Disease Gallery */}
          <div className="grid gap-4 md:grid-cols-2">
            <SprayLog />
            <DiseaseGallery />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FarmerPortal;