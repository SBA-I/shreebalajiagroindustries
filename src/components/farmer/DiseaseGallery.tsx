import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Microscope, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Scan {
  id: string;
  scan_date: string;
  crop: string | null;
  diagnosis: string;
  severity: string | null;
  recommendation: string | null;
  image_url: string | null;
}

const DiseaseGallery = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("disease_scans")
      .select("*")
      .order("scan_date", { ascending: false })
      .limit(12);
    setScans((data ?? []) as Scan[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from("disease_scans").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Microscope className="h-5 w-5 text-primary" /> My Crop Doctor
        </CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/ask-ai"><Camera className="h-4 w-4" /> Quick Scan</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No scans yet. Use Balaji AI's disease detector to identify crop problems — results appear here for trend analysis.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {scans.map((s) => (
              <div key={s.id} className="group relative overflow-hidden rounded-md border">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.diagnosis} className="aspect-square w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    <Microscope className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1 p-2">
                  <p className="text-xs font-semibold leading-tight line-clamp-2">{s.diagnosis}</p>
                  <p className="text-[10px] text-muted-foreground" translate="no">
                    {new Date(s.scan_date).toLocaleDateString()}
                  </p>
                  {s.severity && (
                    <Badge variant="outline" className="text-[9px]">{s.severity}</Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition group-hover:opacity-100"
                  onClick={() => remove(s.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiseaseGallery;