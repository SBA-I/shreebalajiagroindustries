import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, X, Loader2, Download } from "lucide-react";
import InvoiceDownload from "@/components/distributor/InvoiceDownload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrderManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["dist-orders-all", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const filtered = orders?.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.order_items?.some((i: any) => i.product_name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const statusOptions = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <DistributorLayout title="Order Management" subtitle="Manage and track all your orders">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0"><Plus className="h-4 w-4" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Create New Order</DialogTitle>
            </DialogHeader>
            <NewOrderForm userId={user?.id ?? ""} onClose={() => { setNewOrderOpen(false); queryClient.invalidateQueries({ queryKey: ["dist-orders-all"] }); }} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No orders found.</td></tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{order.order_number}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          {order.order_items?.map((item: any, i: number) => (
                            <p key={i} className="text-sm text-foreground">
                              {item.product_name} <span className="text-muted-foreground">× {item.quantity} {item.unit}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">₹{Number(order.total).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <InvoiceDownload order={order} />
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[selectedOrder.status] ?? ""}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm text-foreground">{new Date(selectedOrder.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {selectedOrder.delivery_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Date</span>
                  <span className="text-sm text-foreground">{new Date(selectedOrder.delivery_date).toLocaleDateString("en-IN")}</span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-sm font-medium text-foreground mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} × ₹{item.price}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">₹{(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-heading font-semibold text-foreground">Total</span>
                <span className="font-heading font-bold text-lg text-foreground">₹{Number(selectedOrder.total).toLocaleString()}</span>
              </div>
              {selectedOrder.notes && (
                <p className="text-sm text-muted-foreground italic bg-muted rounded-lg p-3">{selectedOrder.notes}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DistributorLayout>
  );
};

const NewOrderForm = ({ userId, onClose }: { userId: string; onClose: () => void }) => {
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["active-products-for-order"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price, unit").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);

    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) { toast.error("Add at least one product"); setSubmitting(false); return; }

    const total = validItems.reduce((sum, item) => {
      const prod = products?.find(p => p.id === item.productId);
      return sum + (prod?.price ?? 0) * item.quantity;
    }, 0);

    // Create order
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: userId,
      order_number: "PENDING",
      total,
    }).select().single();

    if (orderErr || !order) {
      toast.error(orderErr?.message ?? "Failed to create order");
      setSubmitting(false);
      return;
    }

    // Create order items
    const orderItems = validItems.map(item => {
      const prod = products?.find(p => p.id === item.productId);
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: prod?.name ?? "",
        quantity: item.quantity,
        unit: prod?.unit ?? "L",
        price: prod?.price ?? 0,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    setSubmitting(false);

    if (itemsErr) {
      toast.error("Order created but failed to add items");
    } else {
      toast.success("Order submitted successfully!");
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-foreground mb-1 block">Product</label>
            <select
              value={item.productId}
              onChange={(e) => { const n = [...items]; n[i].productId = e.target.value; setItems(n); }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="">Select product...</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/{p.unit}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-foreground mb-1 block">Qty</label>
            <Input
              type="number" min={1} value={item.quantity}
              onChange={(e) => { const n = [...items]; n[i].quantity = Number(e.target.value); setItems(n); }}
              required
            />
          </div>
          {items.length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
        <Plus className="h-3 w-3" /> Add Item
      </Button>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Order
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
};

export default OrderManagement;
