import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Package, ArrowUpDown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const InventoryManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [adjustItem, setAdjustItem] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState("");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["dist-inventory-full", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory")
        .select("*, products(name, category)")
        .eq("distributor_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const items = inventory?.map(i => ({
    ...i,
    productName: (i as any).products?.name ?? "Unknown",
    category: (i as any).products?.category ?? "—",
  })) ?? [];

  const categories = ["all", ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = items.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(i => i.current_stock < i.min_stock).length;
  const totalStock = items.reduce((s, i) => s + i.current_stock, 0);

  const chartData = items.map(i => ({
    name: i.productName.split(" ").slice(0, 2).join(" "),
    stock: i.current_stock,
    min: i.min_stock,
    isLow: i.current_stock < i.min_stock,
  }));

  const getStockLevel = (item: any) => {
    const pct = (item.current_stock / item.max_stock) * 100;
    if (item.current_stock < item.min_stock) return { label: "Low", color: "bg-destructive", pct };
    if (pct < 50) return { label: "Medium", color: "bg-amber-500", pct };
    return { label: "Good", color: "bg-primary", pct };
  };

  const handleAdjust = async () => {
    if (!adjustItem || !adjustQty) return;
    const newStock = adjustItem.current_stock + parseInt(adjustQty);
    const { error } = await supabase.from("inventory").update({ current_stock: Math.max(0, newStock) }).eq("id", adjustItem.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Stock updated for ${adjustItem.productName}`);
      queryClient.invalidateQueries({ queryKey: ["dist-inventory-full"] });
    }
    setAdjustItem(null);
    setAdjustQty("");
  };

  if (isLoading) {
    return (
      <DistributorLayout title="Inventory Management" subtitle="Track stock levels and manage reorders">
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout title="Inventory Management" subtitle="Track stock levels and manage reorders">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Products</p><p className="font-heading text-xl font-bold text-foreground">{items.length}</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center"><ArrowUpDown className="h-5 w-5 text-secondary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Stock Units</p><p className="font-heading text-xl font-bold text-foreground">{totalStock.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-destructive/20 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Low Stock Items</p><p className="font-heading text-xl font-bold text-destructive">{lowStockCount}</p></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <h2 className="font-heading font-semibold text-foreground mb-4">Stock Levels Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="min" fill="hsl(var(--destructive) / 0.2)" name="Min Stock" radius={[2, 2, 0, 0]} />
              <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isLow ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters + Table */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]">
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Min / Max</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No inventory items found. Contact admin to set up your inventory.</td></tr>
              ) : filtered.map((item) => {
                const level = getStockLevel(item);
                return (
                  <tr key={item.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${item.current_stock < item.min_stock ? "text-destructive" : "text-foreground"}`}>
                        {item.current_stock} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${level.color}`} style={{ width: `${Math.min(level.pct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{level.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.min_stock} / {item.max_stock}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)}>Adjust</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Dialog */}
      <Dialog open={!!adjustItem} onOpenChange={() => setAdjustItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Adjust Stock: {adjustItem?.productName}</DialogTitle></DialogHeader>
          {adjustItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Current stock: <span className="font-bold text-foreground">{adjustItem.current_stock} {adjustItem.unit}</span></p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Adjustment (+/-)</label>
                <Input type="number" placeholder="e.g. +50 or -20" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAdjust} className="flex-1">Update Stock</Button>
                <Button variant="outline" onClick={() => setAdjustItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DistributorLayout>
  );
};

export default InventoryManagement;
