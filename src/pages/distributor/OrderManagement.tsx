import { useState } from "react";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { mockOrders, statusColors, type Order } from "@/data/distributor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, X, ChevronDown, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { products } from "@/data/products";
import { toast } from "sonner";

const statusOptions: (Order["status"] | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const OrderManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const filtered = mockOrders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DistributorLayout title="Order Management" subtitle="Manage and track all your orders">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Order["status"] | "all")}
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
            <NewOrderForm onClose={() => setNewOrderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Delivery</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No orders found.</td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm text-foreground">
                            {item.productName} <span className="text-muted-foreground">× {item.quantity} {item.unit}</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">₹{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{order.deliveryDate || "—"}</td>
                    <td className="px-6 py-4 text-right">
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm text-foreground">{selectedOrder.date}</span>
              </div>
              {selectedOrder.deliveryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Date</span>
                  <span className="text-sm text-foreground">{selectedOrder.deliveryDate}</span>
                </div>
              )}

              {/* Progress */}
              <div className="pt-2">
                <p className="text-sm font-medium text-foreground mb-3">Order Progress</p>
                <OrderProgress status={selectedOrder.status} />
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <p className="text-sm font-medium text-foreground mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} × ₹{item.price}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">₹{(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-heading font-semibold text-foreground">Total</span>
                <span className="font-heading font-bold text-lg text-foreground">₹{selectedOrder.total.toLocaleString()}</span>
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

const OrderProgress = ({ status }: { status: Order["status"] }) => {
  const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIndex = status === "cancelled" ? -1 : steps.indexOf(status);

  if (status === "cancelled") {
    return <p className="text-sm text-destructive font-medium">This order has been cancelled.</p>;
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            i <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const NewOrderForm = ({ onClose }: { onClose: () => void }) => {
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order submitted successfully! It will be reviewed shortly.");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-foreground mb-1 block">Product</label>
            <select
              value={item.productId}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].productId = e.target.value;
                setItems(newItems);
              }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-foreground mb-1 block">Qty</label>
            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].quantity = Number(e.target.value);
                setItems(newItems);
              }}
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
        <Button type="submit" className="flex-1">Submit Order</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
};

export default OrderManagement;
