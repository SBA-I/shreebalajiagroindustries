import DistributorLayout from "@/components/distributor/DistributorLayout";
import { mockOrders, mockInventory, mockMessages, statusColors } from "@/data/distributor";
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle,
  IndianRupee, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Oct", sales: 185000 },
  { month: "Nov", sales: 210000 },
  { month: "Dec", sales: 165000 },
  { month: "Jan", sales: 240000 },
  { month: "Feb", sales: 290000 },
  { month: "Mar", sales: 232000 },
];

const DistributorDashboard = () => {
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const totalRevenue = mockOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const lowStockItems = mockInventory.filter((i) => i.currentStock < i.minStock);
  const unreadMessages = mockMessages.filter((m) => !m.read).length;

  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      change: "+12.5%",
      up: true,
      icon: IndianRupee,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      change: "+3 this month",
      up: true,
      icon: ShoppingCart,
      color: "text-secondary bg-secondary/10",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      change: "Action needed",
      up: false,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Low Stock Alerts",
      value: lowStockItems.length,
      change: "Items below min",
      up: false,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <DistributorLayout title="Dashboard" subtitle="Welcome back, Rajesh Patel">
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
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions + Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
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
                  {unreadMessages > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-card rounded-xl border border-destructive/20 p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="font-heading font-semibold text-foreground">Low Stock</h2>
              </div>
              <ul className="space-y-3">
                {lowStockItems.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{item.currentStock} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
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
          <Link to="/distributor/orders">
            <Button variant="link" size="sm">View All →</Button>
          </Link>
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
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.items.length} item(s)</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">₹{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DistributorLayout>
  );
};

export default DistributorDashboard;
