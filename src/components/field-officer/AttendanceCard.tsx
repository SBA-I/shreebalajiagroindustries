import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttendanceRow {
  id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
}

const getPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
  });

const AttendanceCard = ({ userId }: { userId: string }) => {
  const [today, setToday] = useState<AttendanceRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("field_officer_attendance")
      .select("id,check_in_at,check_out_at,check_in_lat,check_in_lng")
      .eq("officer_id", userId)
      .gte("check_in_at", start.toISOString())
      .order("check_in_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setToday(data as AttendanceRow | null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const checkIn = async () => {
    setBusy(true);
    try {
      const pos = await getPosition();
      const { error } = await supabase.from("field_officer_attendance").insert({
        officer_id: userId,
        check_in_lat: pos.coords.latitude,
        check_in_lng: pos.coords.longitude,
      });
      if (error) throw error;
      toast.success("Checked in for today");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not check in");
    } finally { setBusy(false); }
  };

  const checkOut = async () => {
    if (!today) return;
    setBusy(true);
    try {
      const pos = await getPosition();
      const { error } = await supabase
        .from("field_officer_attendance")
        .update({
          check_out_at: new Date().toISOString(),
          check_out_lat: pos.coords.latitude,
          check_out_lng: pos.coords.longitude,
        })
        .eq("id", today.id);
      if (error) throw error;
      toast.success("Checked out");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not check out");
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !today ? (
          <>
            <p className="text-muted-foreground">You have not checked in today.</p>
            <Button onClick={checkIn} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
              Check-in / Start Day
            </Button>
          </>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">
              In: {new Date(today.check_in_at).toLocaleTimeString()}
              {today.check_in_lat && ` • ${today.check_in_lat.toFixed(4)}, ${today.check_in_lng?.toFixed(4)}`}
            </div>
            {today.check_out_at ? (
              <div className="text-xs text-primary font-medium">
                Out: {new Date(today.check_out_at).toLocaleTimeString()} ✓ Day complete
              </div>
            ) : (
              <Button onClick={checkOut} disabled={busy} variant="outline" className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                Check-out / End Day
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;