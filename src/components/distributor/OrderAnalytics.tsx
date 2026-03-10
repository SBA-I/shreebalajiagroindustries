import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Package, Clock, IndianRupee } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(142 76% 36%)", "hsl(48 96% 53%)"];

const OrderAnalytics = () => {
  const { user } = useAuth();

  const { data: orders } = useQuery({
    queryKey: ["analytics-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(product_name, quantity, price)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Monthly purchase trend (last 6 months)
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[d.toLocaleString("en-US", { month: "short" })] = 0;
    }
    orders?.filter(o => o.status !== "cancelled").forEach(o => {
      const key = new Date(o.created_at).toLocaleString("en-US", { month: "short" });
      if (key in months) months[key] += Number(o.total);
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  })();

  // Top products by quantity
  const topProducts = (() => {
    const map: Record<string, number> = {};
    orders?.forEach(o => {
      o.order_items?.forEach((item: any) => {
        map[item.product_name] = (map[item.product_name] ?? 0) + item.quantity;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name: name.split(" ").slice(0, 3).join(" "), qty }));
  })();

  const totalSpent = orders?.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0) ?? 0;
  const pendingOrders = orders?.filter(o => ["pending", "confirmed", "processing"].includes(o.status)).length ?? 0;
  const thisMonthOrders = orders?.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Purchases</p>
            <p className="font-heading text-xl font-bold text-foreground">₹{(totalSpent / 100000).toFixed(1)}L</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="font-heading text-xl font-bold text-foreground">{thisMonthOrders} orders</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
            <p className="font-heading text-xl font-bold text-foreground">{pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">Monthly Purchases</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">Top Products</h3>
          </div>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={topProducts} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, qty }) => `${name} (${qty})`}>
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No order data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
