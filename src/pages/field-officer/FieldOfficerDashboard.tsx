import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Target, ShoppingCart, TrendingUp } from "lucide-react";

const FieldOfficerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ visits: 0, meetings: 0, target: 0, achieved: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [visitsRes, meetingsRes, targetRes] = await Promise.all([
        supabase.from("dealer_visits").select("id", { count: "exact", head: true }).eq("officer_id", user.id),
        supabase.from("farmer_meetings").select("id", { count: "exact", head: true }).eq("officer_id", user.id),
        supabase.from("sales_targets").select("target_amount, achieved_amount").eq("officer_id", user.id).eq("month", month).eq("year", year).maybeSingle(),
      ]);

      setStats({
        visits: visitsRes.count ?? 0,
        meetings: meetingsRes.count ?? 0,
        target: targetRes.data?.target_amount ?? 0,
        achieved: targetRes.data?.achieved_amount ?? 0,
      });
    };
    fetchStats();
  }, [user]);

  const progress = stats.target > 0 ? Math.round((stats.achieved / stats.target) * 100) : 0;

  return (
    <FieldOfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Field Officer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your activity summary.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visits}</div>
              <p className="text-xs text-muted-foreground">Dealer visits logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Farmer Meetings</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.meetings}</div>
              <p className="text-xs text-muted-foreground">Meetings recorded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales Target</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.target.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month's target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Achievement</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FieldOfficerLayout>
  );
};

export default FieldOfficerDashboard;
