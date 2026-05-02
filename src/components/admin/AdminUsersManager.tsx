import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldPlus, ShieldMinus, Trash2, ChevronDown, ChevronRight, MapPin, Phone, Mail, Briefcase, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "field_officer" | "distributor" | "farmer" | "user";

// Categories shown in tabs (admin intentionally excluded)
const CATEGORIES: { key: AppRole; label: string }[] = [
  { key: "farmer", label: "Farmers" },
  { key: "distributor", label: "Distributors" },
  { key: "field_officer", label: "Field Officers" },
];

// Roles an admin can grant/revoke from this UI (admin role excluded — provisioned manually)
const GRANTABLE_ROLES: AppRole[] = ["farmer", "distributor", "field_officer", "moderator"];

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  requested_role: AppRole;
  state: string | null;
  district: string | null;
  taluka: string | null;
  crops: string[] | null;
  land_size_acres: number | null;
  preferred_language: string | null;
  shop_name: string | null;
  gst_number: string | null;
  license_number: string | null;
  shop_address: string | null;
  employee_id: string | null;
  assigned_territory: string | null;
  verification_status: string;
  created_at: string;
}

const AdminUsersManager = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const refresh = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles((p ?? []) as ProfileRow[]);
    const map: Record<string, AppRole[]> = {};
    (r ?? []).forEach((row: any) => {
      (map[row.user_id] ||= []).push(row.role);
    });
    setRolesByUser(map);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const grant = async (user_id: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id, role });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success(`Granted ${role}`);
    refresh();
  };

  const revoke = async (user_id: string, role: AppRole) => {
    if (!confirm(`Remove ${role} role from this user?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${role}`);
    refresh();
  };

  const deleteUser = async (user_id: string, name: string | null) => {
    if (!confirm(`Permanently delete ${name || "this user"}? This removes their account, profile and roles. This cannot be undone.`)) return;
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) return toast.error("Not authenticated");
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (error || (data as any)?.error) {
      return toast.error((data as any)?.error || error?.message || "Failed to delete user");
    }
    toast.success("User deleted");
    refresh();
  };

  const matches = (p: ProfileRow) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.full_name?.toLowerCase().includes(q) ?? false) ||
      (p.phone?.includes(q) ?? false) ||
      (p.state?.toLowerCase().includes(q) ?? false) ||
      (p.district?.toLowerCase().includes(q) ?? false) ||
      (p.shop_name?.toLowerCase().includes(q) ?? false) ||
      (p.employee_id?.toLowerCase().includes(q) ?? false)
    );
  };

  // Filter out admin users entirely + only those whose requested_role is one of the categories
  // (Admin accounts are managed separately and intentionally hidden here.)
  const visibleProfiles = profiles.filter((p) => {
    const roles = rolesByUser[p.user_id] ?? [];
    if (roles.includes("admin")) return false;
    return matches(p);
  });

  const renderUserCard = (p: ProfileRow) => {
    const roles = rolesByUser[p.user_id] ?? [];
    const ungranted = GRANTABLE_ROLES.filter((r) => !roles.includes(r));
    const isOpen = !!expanded[p.user_id];

    return (
      <div key={p.user_id} className="py-3 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <button
            onClick={() => setExpanded({ ...expanded, [p.user_id]: !isOpen })}
            className="flex items-start gap-2 text-left min-w-0 flex-1 hover:opacity-80"
          >
            {isOpen ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {p.full_name || "—"}
                {p.phone && <span className="text-xs text-muted-foreground font-normal ml-2">{p.phone}</span>}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="capitalize">Requested: {p.requested_role.replace("_", " ")}</span>
                {p.state && <span>· {[p.taluka, p.district, p.state].filter(Boolean).join(", ")}</span>}
                <Badge variant="outline" className="capitalize text-[10px]">{p.verification_status}</Badge>
              </p>
            </div>
          </button>
          <Button size="sm" variant="ghost" onClick={() => deleteUser(p.user_id, p.full_name)} className="text-destructive hover:bg-destructive/10 gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>

        {isOpen && (
          <div className="pl-6 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-muted/30 rounded-md p-3">
            {p.phone && <Field icon={Phone} label="Phone" value={p.phone} />}
            {p.preferred_language && <Field label="Language" value={p.preferred_language.toUpperCase()} />}
            {p.state && <Field icon={MapPin} label="Location" value={[p.taluka, p.district, p.state].filter(Boolean).join(", ")} />}
            {p.crops && p.crops.length > 0 && <Field label="Crops" value={p.crops.join(", ")} />}
            {p.land_size_acres != null && <Field label="Land" value={`${p.land_size_acres} acres`} />}
            {p.shop_name && <Field icon={Store} label="Shop" value={p.shop_name} />}
            {p.shop_address && <Field label="Shop Address" value={p.shop_address} />}
            {p.gst_number && <Field label="GST No." value={p.gst_number} />}
            {p.license_number && <Field label="License" value={p.license_number} />}
            {p.employee_id && <Field icon={Briefcase} label="Employee ID" value={p.employee_id} />}
            {p.assigned_territory && <Field label="Territory" value={p.assigned_territory} />}
            <Field label="Joined" value={new Date(p.created_at).toLocaleDateString()} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pl-6">
          {roles.length === 0 && <span className="text-xs text-muted-foreground">No roles granted.</span>}
          {roles.map((r) => (
            <Badge key={r} className="gap-1 bg-primary/10 text-primary capitalize">
              {r.replace("_", " ")}
              <button onClick={() => revoke(p.user_id, r)} className="ml-1 hover:text-destructive" aria-label={`Revoke ${r}`}>
                <ShieldMinus className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {ungranted.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-2">
              {ungranted.map((r) => (
                <Button key={r} size="sm" variant="outline" className="h-7 text-xs gap-1 capitalize" onClick={() => grant(p.user_id, r)}>
                  <ShieldPlus className="h-3 w-3" /> {r.replace("_", " ")}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const grouped = (cat: AppRole) =>
    visibleProfiles.filter((p) => p.requested_role === cat);

  const others = visibleProfiles.filter(
    (p) => !CATEGORIES.some((c) => c.key === p.requested_role),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle className="text-base">Users &amp; Roles ({visibleProfiles.length})</CardTitle>
        <Input className="max-w-xs" placeholder="Search name, phone, location, shop…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="farmer">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.key} value={c.key} className="text-xs sm:text-sm">
                  {c.label} ({grouped(c.key).length})
                </TabsTrigger>
              ))}
              <TabsTrigger value="other" className="text-xs sm:text-sm">Other ({others.length})</TabsTrigger>
            </TabsList>

            {CATEGORIES.map((c) => {
              const list = grouped(c.key);
              return (
                <TabsContent key={c.key} value={c.key}>
                  {list.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">No {c.label.toLowerCase()} found.</p>
                  ) : (
                    <div className="divide-y divide-border">{list.map(renderUserCard)}</div>
                  )}
                </TabsContent>
              );
            })}

            <TabsContent value="other">
              {others.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No other users.</p>
              ) : (
                <div className="divide-y divide-border">{others.map(renderUserCard)}</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

const Field = ({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) => (
  <div className="flex items-start gap-1.5">
    {Icon && <Icon className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />}
    <span className="text-muted-foreground">{label}:</span>
    <span className="text-foreground font-medium break-words">{value}</span>
  </div>
);

export default AdminUsersManager;
