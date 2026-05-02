import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldPlus, ShieldMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "field_officer" | "distributor" | "farmer" | "user";
const ALL_ROLES: AppRole[] = ["admin", "moderator", "field_officer", "distributor", "farmer", "user"];

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  requested_role: AppRole;
  state: string | null;
  district: string | null;
  verification_status: string;
  created_at: string;
}

const AdminUsersManager = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, requested_role, state, district, verification_status, created_at").order("created_at", { ascending: false }),
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
    if (!confirm(`Remove ${role} role?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${role}`);
    refresh();
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.full_name?.toLowerCase().includes(q) ?? false) || (p.phone?.includes(q) ?? false) || (p.requested_role.includes(q));
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle className="text-base">Users &amp; Roles ({profiles.length})</CardTitle>
        <Input className="max-w-xs" placeholder="Search by name, phone, role…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => {
              const roles = rolesByUser[p.user_id] ?? [];
              const ungranted = ALL_ROLES.filter((r) => !roles.includes(r));
              return (
                <div key={p.user_id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.full_name || "—"}
                        <span className="text-xs text-muted-foreground font-normal ml-2">{p.phone}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested: <span className="capitalize">{p.requested_role}</span>
                        {p.state && ` · ${p.district ?? ""}, ${p.state}`}
                        <span className="ml-2"> · status:
                          <Badge variant="outline" className="ml-1 capitalize">{p.verification_status}</Badge>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {roles.length === 0 && <span className="text-xs text-muted-foreground">No roles granted.</span>}
                    {roles.map((r) => (
                      <Badge key={r} className="gap-1 bg-primary/10 text-primary capitalize">
                        {r}
                        <button onClick={() => revoke(p.user_id, r)} className="ml-1 hover:text-destructive" aria-label={`Revoke ${r}`}>
                          <ShieldMinus className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {ungranted.length > 0 && (
                      <div className="flex gap-1 ml-2">
                        {ungranted.map((r) => (
                          <Button key={r} size="sm" variant="outline" className="h-7 text-xs gap-1 capitalize" onClick={() => grant(p.user_id, r)}>
                            <ShieldPlus className="h-3 w-3" /> {r}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No users match.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersManager;