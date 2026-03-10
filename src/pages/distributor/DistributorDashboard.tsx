import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle,
  IndianRupee, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const DistributorDashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["dist-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["dist-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: inventory } = useQuery({
    queryKey: ["dist-inventory", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("inventory").select("*, products(name, category)").eq("distributor_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["dist-unread", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("read", false);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending" || o.status === "confirmed").length ?? 0;
  const totalRevenue = orders?.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0) ?? 0;
  const lowStockItems = inventory?.filter((i) => i.current_stock < i.min_stock) ?? [];

  // Build monthly chart data from real orders
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short" });
      months[key] = 0;
    }
    orders?.filter(o => o.status !== "cancelled").forEach(o => {
      const d = new Date(o.created_at);
      const key = d.toLocaleString("en-US", { month: "short" });
      if (key in months) months[key] += Number(o.total);
    });
    return Object.entries(months).map(([month, sales]) => ({ month, sales }));
  })();

  const kpis = [
    { label: "Total Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, change: `${totalOrders} orders`, up: true, icon: IndianRupee, color: "text-primary bg-primary/10" },
    { label: "Total Orders", value: totalOrders, change: `${pendingOrders} pending`, up: true, icon: ShoppingCart, color: "text-secondary bg-secondary/10" },
    { label: "Pending Orders", value: pendingOrders, change: "Action needed", up: false, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Low Stock Alerts", value: lowStockItems.length, change: "Items below min", up: false, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <DistributorLayout title="Dashboard" subtitle={`Welcome back, ${profile?.full_name || "Distributor"}`}>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? "text-primary" : "text-muted-foreground"}`}>
              {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Monthly Sales</h2>
              <p className="text-xs text-muted-foreground">Last 6 months revenue (₹)</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions + Alerts */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-heading font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/distributor/orders">
                <Button variant="default" className="w-full justify-start gap-2" size="sm">
                  <ShoppingCart className="h-4 w-4" /> New Order
                </Button>
              </Link>
              <Link to="/distributor/inventory">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Package className="h-4 w-4" /> Check Inventory
                </Button>
              </Link>
              <Link to="/distributor/messages">
                <Button variant="outline" className="w-full justify-start gap-2 relative" size="sm">
                  Messages
                  {(unreadCount ?? 0) > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div className="bg-card rounded-xl border border-destructive/20 p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="font-heading font-semibold text-foreground">Low Stock</h2>
              </div>
              <ul className="space-y-3">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{(item as any).products?.name ?? "Product"}</p>
                      <p className="text-xs text-muted-foreground">{(item as any).products?.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{item.current_stock} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">Min: {item.min_stock}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 bg-card rounded-xl border border-border shadow-card">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-heading font-semibold text-foreground">Recent Orders</h2>
          <Link to="/distributor/orders"><Button variant="link" size="sm">View All →</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders?.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.order_items?.length ?? 0} item(s)</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">₹{Number(order.total).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No orders yet. Place your first order!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DistributorLayout>
  );
};

export default DistributorDashboard;
