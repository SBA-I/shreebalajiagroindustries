import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Target, TrendingUp } from "lucide-react";

interface SalesTarget {
  id: string;
  month: number;
  year: number;
  target_amount: number;
  achieved_amount: number;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalesTargets = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("sales_targets")
        .select("*")
        .eq("officer_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      setTargets((data as SalesTarget[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <FieldOfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Sales Targets</h1>
          <p className="text-muted-foreground">Track your monthly sales performance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : targets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No sales targets assigned yet. Your admin will set monthly targets for you.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {targets.map((t) => {
              const progress = t.target_amount > 0 ? Math.round((t.achieved_amount / t.target_amount) * 100) : 0;
              const isCurrentMonth = t.month === new Date().getMonth() + 1 && t.year === new Date().getFullYear();
              return (
                <Card key={t.id} className={isCurrentMonth ? "border-primary/50 shadow-md" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {isCurrentMonth && <Target className="h-4 w-4 text-primary" />}
                        {monthNames[t.month - 1]} {t.year}
                      </CardTitle>
                      <span className={`text-sm font-bold ${progress >= 100 ? "text-green-600" : progress >= 75 ? "text-primary" : "text-muted-foreground"}`}>
                        {progress}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-semibold">₹{t.target_amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Achieved</p>
                          <p className="font-semibold flex items-center gap-1">
                            {progress >= 100 && <TrendingUp className="h-3 w-3 text-green-600" />}
                            ₹{t.achieved_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </FieldOfficerLayout>
  );
};

export default SalesTargets;
