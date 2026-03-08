import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Shield, LogOut,
  Search, Plus, Pencil, Trash2, ChevronLeft,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

type Tab = "overview" | "products" | "users" | "orders";

const AdminDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!user) return <Navigate to="/login" replace />;
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "products" as Tab, label: "Products", icon: Package },
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold text-foreground">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="space-y-2 pt-4 border-t border-border">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="gap-2 whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "orders" && <OrdersTab />}
      </main>
    </div>
  );
};

/* ==================== OVERVIEW ==================== */
const OverviewTab = () => {
  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: users } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders-count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Products", value: products ?? 0, icon: Package, color: "text-primary bg-primary/10" },
    { label: "Users", value: users ?? 0, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Orders", value: orders ?? 0, icon: ShoppingCart, color: "text-accent-foreground bg-accent/20" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== PRODUCTS ==================== */
const ProductsTab = () => {
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Product deleted"); refetch(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Products</h1>
        <Button className="gap-2" onClick={() => { setEditProduct(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-sm text-foreground">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditProduct(p); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        product={editProduct}
        onSaved={() => { setShowForm(false); refetch(); }}
      />
    </div>
  );
};

const ProductFormDialog = ({ open, onClose, product, onSaved }: {
  open: boolean; onClose: () => void; product: any; onSaved: () => void;
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<string>("Insecticides");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when product changes
  useState(() => {
    if (product) {
      setName(product.name); setSlug(product.slug);
      setCategory(product.category); setPrice(String(product.price ?? ""));
      setDescription(product.description ?? "");
    } else {
      setName(""); setSlug(""); setCategory("Insecticides"); setPrice(""); setDescription("");
    }
  });

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Name and slug are required"); return; }
    setLoading(true);
    const payload = { name, slug, category: category as any, price: price ? parseFloat(price) : null, description };
    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) toast.error(error.message); else { toast.success("Product updated"); onSaved(); }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error(error.message); else { toast.success("Product created"); onSaved(); }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{product ? "Edit" : "Add"} Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-foreground mb-1 block">Name</label>
            <Input value={name} onChange={(e) => { setName(e.target.value); if (!product) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} />
          </div>
          <div><label className="text-sm font-medium text-foreground mb-1 block">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div><label className="text-sm font-medium text-foreground mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="Insecticides">Insecticides</option>
              <option value="Fungicides">Fungicides</option>
              <option value="Herbicides">Herbicides</option>
              <option value="PGR">PGR</option>
            </select>
          </div>
          <div><label className="text-sm font-medium text-foreground mb-1 block">Price (₹)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div><label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading} className="flex-1">{product ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ==================== USERS ==================== */
const UsersTab = () => {
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getRoles = (userId: string) =>
    roles?.filter((r) => r.user_id === userId).map((r) => r.role) ?? [];

  const handleSetRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").upsert(
      { user_id: userId, role: role as any },
      { onConflict: "user_id,role" }
    );
    if (error) toast.error(error.message);
    else toast.success(`Role ${role} assigned`);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Users</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.full_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {getRoles(p.user_id).map((r) => (
                        <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{r}</span>
                      ))}
                      {getRoles(p.user_id).length === 0 && <span className="text-xs text-muted-foreground">No role</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <select
                      onChange={(e) => { if (e.target.value) handleSetRole(p.user_id, e.target.value); e.target.value = ""; }}
                      defaultValue=""
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="" disabled>Assign...</option>
                      <option value="admin">Admin</option>
                      <option value="distributor">Distributor</option>
                      <option value="dealer">Dealer</option>
                      <option value="farmer">Farmer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ==================== ORDERS ==================== */
const OrdersTab = () => {
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">All Orders</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.order_items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">₹{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
