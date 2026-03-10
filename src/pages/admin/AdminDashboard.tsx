import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Shield, LogOut,
  Search, Plus, Pencil, Trash2, ChevronLeft, CheckCircle, XCircle,
  MessageSquare, UserCheck, MapPin, TrendingUp,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import logoImg from "@/assets/logo-sbai.png";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type Tab = "overview" | "products" | "users" | "orders" | "approvals" | "inquiries" | "field-officers";

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
    { id: "users" as Tab, label: "Users & Roles", icon: Users },
    { id: "approvals" as Tab, label: "Approvals", icon: UserCheck },
    { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
    { id: "inquiries" as Tab, label: "Inquiries", icon: MessageSquare },
    { id: "field-officers" as Tab, label: "Field Officers", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <img src={logoImg} alt="SBAI" className="h-7 w-7 object-contain" />
          <span className="font-heading text-sm font-bold text-primary">Admin Panel</span>
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
        {activeTab === "approvals" && <ApprovalsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "inquiries" && <InquiriesTab />}
        {activeTab === "field-officers" && <FieldOfficersTab />}
      </main>
    </div>
  );
};

/* ==================== OVERVIEW ==================== */
const OverviewTab = () => {
  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true);
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
  const { data: pendingApprovals } = useQuery({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_approved", false);
      return count ?? 0;
    },
  });
  const { data: unresolvedInquiries } = useQuery({
    queryKey: ["admin-inquiries-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contact_inquiries").select("*", { count: "exact", head: true }).eq("is_resolved", false);
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Active Products", value: products ?? 0, icon: Package, color: "text-primary bg-primary/10" },
    { label: "Total Users", value: users ?? 0, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Total Orders", value: orders ?? 0, icon: ShoppingCart, color: "text-accent-foreground bg-accent/20" },
    { label: "Pending Approvals", value: pendingApprovals ?? 0, icon: UserCheck, color: "text-amber-600 bg-amber-100" },
    { label: "Open Inquiries", value: unresolvedInquiries ?? 0, icon: MessageSquare, color: "text-blue-600 bg-blue-100" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
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

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !isActive }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(isActive ? "Product deactivated" : "Product activated"); refetch(); }
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.price ? `₹${p.price}` : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(p.id, p.is_active)}>
                      <span className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
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
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState<string>(product?.category ?? "Insecticides");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [technicalName, setTechnicalName] = useState(product?.technical_name ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Name and slug are required"); return; }
    setLoading(true);
    const payload = {
      name, slug,
      category: category as any,
      price: price ? parseFloat(price) : null,
      description: description || null,
      technical_name: technicalName || null,
    };
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
          <div><label className="text-sm font-medium text-foreground mb-1 block">Technical Name</label>
            <Input value={technicalName} onChange={(e) => setTechnicalName(e.target.value)} placeholder="e.g., Imidacloprid 17.8% SL" />
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
  const queryClient = useQueryClient();
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles, refetch: refetchRoles } = useQuery({
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
    else { toast.success(`Role ${role} assigned`); refetchRoles(); }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete()
      .eq("user_id", userId).eq("role", role as any);
    if (error) toast.error(error.message);
    else { toast.success(`Role ${role} removed`); refetchRoles(); }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Users & Roles</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Approved</th>
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
                        <button key={r} onClick={() => handleRemoveRole(p.user_id, r)} title="Click to remove role">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors">
                            {r} ×
                          </span>
                        </button>
                      ))}
                      {getRoles(p.user_id).length === 0 && <span className="text-xs text-muted-foreground">No role</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_approved ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800"}`}>
                      {p.is_approved ? "Yes" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
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
                      <option value="field_officer">Field Officer</option>
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

/* ==================== APPROVALS ==================== */
const ApprovalsTab = () => {
  const queryClient = useQueryClient();

  const { data: pendingProfiles, refetch } = useQuery({
    queryKey: ["admin-pending-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
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
    roles?.filter((r) => r.user_id === userId).map((r) => r.role).join(", ") ?? "—";

  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({ is_approved: true }).eq("user_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("User approved!");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-pending-count"] });
    }
  };

  const handleReject = async (userId: string) => {
    // Just keep as unapproved, admin can remove later
    toast.info("Registration kept as pending. You can assign a role or remove the user.");
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Dealer / Field Officer Approvals</h1>
      <p className="text-muted-foreground mb-6">Review and approve pending registrations</p>

      {!pendingProfiles || pendingProfiles.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">No pending approvals. All caught up! 🎉</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingProfiles.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium text-foreground">{p.full_name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{p.email}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.company_name && <span>🏢 {p.company_name}</span>}
                  {p.phone && <span>📞 {p.phone}</span>}
                  {p.territory && <span>📍 {p.territory}</span>}
                  <span>Role: {getRoles(p.user_id)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Registered: {new Date(p.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" className="gap-1" onClick={() => handleApprove(p.user_id)}>
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleReject(p.user_id)}>
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== ORDERS ==================== */
const OrdersTab = () => {
  const queryClient = useQueryClient();

  const { data: orders, refetch } = useQuery({
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus as any }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success(`Order updated to ${newStatus}`); refetch(); }
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
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.order_items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">₹{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ==================== INQUIRIES ==================== */
const InquiriesTab = () => {
  const { data: inquiries, refetch } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleResolve = async (id: string, isResolved: boolean) => {
    const { error } = await supabase.from("contact_inquiries").update({ is_resolved: !isResolved }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(isResolved ? "Marked as unresolved" : "Marked as resolved"); refetch(); }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Contact Inquiries</h1>
      <p className="text-muted-foreground mb-6">View and manage customer inquiries from the contact form</p>

      {!inquiries || inquiries.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className={`bg-card rounded-xl border p-5 shadow-card ${inq.is_resolved ? "border-border opacity-70" : "border-primary/30"}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{inq.name}</p>
                    <Badge variant="secondary" className="text-xs capitalize">{inq.inquiry_type}</Badge>
                    {inq.is_resolved && <Badge className="bg-primary/10 text-primary text-xs">Resolved</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{inq.email}</p>
                  <p className="text-sm text-foreground mt-2 bg-muted/50 p-3 rounded-lg">{inq.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <Button
                  size="sm"
                  variant={inq.is_resolved ? "outline" : "default"}
                  className="shrink-0"
                  onClick={() => handleResolve(inq.id, inq.is_resolved)}
                >
                  {inq.is_resolved ? "Reopen" : "Mark Resolved"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== FIELD OFFICERS ==================== */
const FieldOfficersTab = () => {
  const { data: visits } = useQuery({
    queryKey: ["admin-all-visits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dealer_visits").select("*").order("visit_date", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: meetings } = useQuery({
    queryKey: ["admin-all-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("farmer_meetings").select("*").order("meeting_date", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: targets, refetch: refetchTargets } = useQuery({
    queryKey: ["admin-all-targets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales_targets").select("*").order("year", { ascending: false }).order("month", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetForm, setTargetForm] = useState({ officer_id: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), target_amount: "" });

  // Get field officer profiles
  const { data: officerRoles } = useQuery({
    queryKey: ["admin-fo-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "field_officer" as any);
      if (error) throw error;
      return data;
    },
  });

  const { data: officerProfiles } = useQuery({
    queryKey: ["admin-fo-profiles", officerRoles],
    queryFn: async () => {
      if (!officerRoles?.length) return [];
      const ids = officerRoles.map(r => r.user_id);
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids);
      if (error) throw error;
      return data;
    },
    enabled: !!officerRoles?.length,
  });

  const handleSetTarget = async () => {
    if (!targetForm.officer_id || !targetForm.target_amount) { toast.error("Fill all fields"); return; }
    const { error } = await supabase.from("sales_targets").upsert({
      officer_id: targetForm.officer_id,
      month: parseInt(targetForm.month),
      year: parseInt(targetForm.year),
      target_amount: parseFloat(targetForm.target_amount),
    }, { onConflict: "officer_id,month,year" });
    if (error) toast.error(error.message);
    else { toast.success("Target set!"); setShowTargetForm(false); refetchTargets(); }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Field Officers</h1>
            <p className="text-muted-foreground">Monitor field activity and set sales targets</p>
          </div>
          <Button className="gap-2" onClick={() => setShowTargetForm(true)}>
            <Plus className="h-4 w-4" /> Set Target
          </Button>
        </div>

        {/* Officers list */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {officerProfiles?.map((o) => (
            <div key={o.user_id} className="bg-card rounded-xl border border-border p-4 shadow-card">
              <p className="font-medium text-foreground">{o.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{o.email}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>📍 {visits?.filter(v => v.officer_id === o.user_id).length ?? 0} visits</span>
                <span>👤 {meetings?.filter(m => m.officer_id === o.user_id).length ?? 0} meetings</span>
              </div>
            </div>
          )) ?? <p className="text-muted-foreground col-span-full">No field officers assigned yet. Assign the "Field Officer" role in Users tab.</p>}
        </div>
      </div>

      {/* Sales Targets */}
      {targets && targets.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Sales Targets</h2>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Officer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Target</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Achieved</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t) => {
                    const progress = t.target_amount > 0 ? Math.round((t.achieved_amount / t.target_amount) * 100) : 0;
                    const officer = officerProfiles?.find(o => o.user_id === t.officer_id);
                    return (
                      <tr key={t.id} className="border-t border-border">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{officer?.full_name ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{monthNames[t.month - 1]} {t.year}</td>
                        <td className="px-4 py-3 text-sm">₹{t.target_amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">₹{t.achieved_amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${progress >= 100 ? "bg-green-500" : "bg-primary"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium">{progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Visits */}
      {visits && visits.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Recent Dealer Visits</h2>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dealer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">GPS</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.slice(0, 20).map((v) => (
                    <tr key={v.id} className="border-t border-border">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{v.dealer_name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{v.dealer_location || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(v.visit_date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm">{v.order_placed ? `₹${v.order_amount?.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 text-sm">{v.latitude ? "📍" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Set Target Dialog */}
      <Dialog open={showTargetForm} onOpenChange={setShowTargetForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Sales Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Field Officer</label>
              <select
                value={targetForm.officer_id}
                onChange={(e) => setTargetForm({ ...targetForm, officer_id: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select officer...</option>
                {officerProfiles?.map((o) => (
                  <option key={o.user_id} value={o.user_id}>{o.full_name || o.email}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Month</label>
                <select value={targetForm.month} onChange={(e) => setTargetForm({ ...targetForm, month: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {monthNames.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Input type="number" value={targetForm.year} onChange={(e) => setTargetForm({ ...targetForm, year: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Target Amount (₹)</label>
              <Input type="number" value={targetForm.target_amount} onChange={(e) => setTargetForm({ ...targetForm, target_amount: e.target.value })} placeholder="e.g., 500000" />
            </div>
            <Button onClick={handleSetTarget} className="w-full">Set Target</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
