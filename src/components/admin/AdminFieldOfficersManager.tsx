import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, UserCog, ChevronDown, ChevronRight, MapPin, ClipboardList, Users, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FieldOfficer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  employee_id: string | null;
  assigned_territory: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  verification_status: string;
  created_at: string;
}

interface OfficerActivity {
  visits: any[];
  audits: any[];
  leads: any[];
  attendance: any[];
  loading: boolean;
}

const blank = {
  email: "", password: "", full_name: "", phone: "",
  employee_id: "", assigned_territory: "",
  state: "Maharashtra", district: "", taluka: "",
};

const AdminFieldOfficersManager = () => {
  const [items, setItems] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activity, setActivity] = useState<Record<string, OfficerActivity>>({});

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,user_id,full_name,phone,employee_id,assigned_territory,state,district,taluka,verification_status,created_at")
      .eq("requested_role", "field_officer")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as FieldOfficer[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name || !form.phone || !form.employee_id) {
      return toast.error("Email, password, name, phone & employee ID are required");
    }
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-field-officer", {
      body: form,
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      return toast.error((data as any)?.error ?? error?.message ?? "Failed to create field officer");
    }
    toast.success("Field officer added & approved");
    setForm(blank);
    refresh();
  };

  const remove = async (user_id: string) => {
    if (!confirm("Delete this field officer's account? This cannot be undone.")) return;
    const { error, data } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id },
    });
    if (error || (data as any)?.error) {
      return toast.error((data as any)?.error ?? error?.message ?? "Failed");
    }
    toast.success("Field officer removed");
    refresh();
  };

  const toggleExpand = async (user_id: string) => {
    const isOpen = !!expanded[user_id];
    setExpanded({ ...expanded, [user_id]: !isOpen });
    if (isOpen || activity[user_id]) return;
    setActivity((a) => ({ ...a, [user_id]: { visits: [], audits: [], leads: [], attendance: [], loading: true } }));
    const [visits, audits, leads, attendance] = await Promise.all([
      supabase.from("field_visits").select("*").eq("officer_id", user_id).order("visit_date", { ascending: false }).limit(50),
      supabase.from("dealer_audits").select("*").eq("officer_id", user_id).order("audit_date", { ascending: false }).limit(50),
      supabase.from("farmer_leads").select("*").eq("officer_id", user_id).order("created_at", { ascending: false }).limit(50),
      supabase.from("field_officer_attendance").select("*").eq("officer_id", user_id).order("check_in_at", { ascending: false }).limit(20),
    ]);
    setActivity((a) => ({
      ...a,
      [user_id]: {
        visits: visits.data ?? [],
        audits: audits.data ?? [],
        leads: leads.data ?? [],
        attendance: attendance.data ?? [],
        loading: false,
      },
    }));
  };

  const approved = items.filter((i) => i.verification_status === "approved");
  const pending = items.filter((i) => i.verification_status === "pending");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4 text-primary" /> Add field officer
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Create the account directly. They will be auto-approved and can sign in immediately with the email & password you set.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Login credentials
            </div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Temporary password *</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" /></div>
            <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" /></div>

            <div className="md:col-span-3 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t border-border pt-3">
              Officer details
            </div>
            <div><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Employee ID *</Label><Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g. SBA-FO-001" /></div>
            <div><Label>Assigned territory</Label><Input value={form.assigned_territory} onChange={(e) => setForm({ ...form, assigned_territory: e.target.value })} placeholder="e.g. North Maharashtra" /></div>
            <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
            <div><Label>Taluka</Label><Input value={form.taluka} onChange={(e) => setForm({ ...form, taluka: e.target.value })} /></div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Field Officer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field officers ({items.length})</CardTitle>
          {pending.length > 0 && (
            <p className="text-xs text-amber-700">
              {pending.length} pending application(s) — approve them in the Verification tab.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : approved.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No approved field officers yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {approved.map((f) => {
                const isOpen = !!expanded[f.user_id];
                const act = activity[f.user_id];
                return (
                  <div key={f.id} className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleExpand(f.user_id)}
                        className="flex items-start gap-2 text-left min-w-0 flex-1 hover:opacity-80"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {f.full_name ?? "—"} <span className="text-xs text-muted-foreground font-normal">· {f.employee_id ?? "no ID"}</span>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {f.phone ?? "—"} · {f.assigned_territory ?? f.district ?? f.state ?? "—"}
                          </p>
                        </div>
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => remove(f.user_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 ml-6 bg-muted/30 rounded-md p-3 space-y-4">
                        {!act || act.loading ? (
                          <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> Visits: {act.visits.length}</Badge>
                              <Badge variant="outline" className="gap-1"><Store className="h-3 w-3" /> Audits: {act.audits.length}</Badge>
                              <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> Leads: {act.leads.length}</Badge>
                              <Badge variant="outline" className="gap-1"><ClipboardList className="h-3 w-3" /> Attendance: {act.attendance.length}</Badge>
                            </div>

                            <ActivitySection title="Field visits" icon={MapPin} empty="No visits logged.">
                              {act.visits.map((v) => (
                                <div key={v.id} className="text-xs py-1.5 border-b border-border/40 last:border-0">
                                  <div className="font-medium">{v.farmer_name} <span className="text-muted-foreground font-normal">· {v.visit_date}</span></div>
                                  <div className="text-muted-foreground">
                                    {[v.village, v.district, v.state].filter(Boolean).join(", ")}
                                    {v.crop && ` · ${v.crop}`}
                                    {v.acreage && ` · ${v.acreage} ac`}
                                  </div>
                                  {v.observations && <div className="text-muted-foreground mt-0.5">Obs: {v.observations}</div>}
                                  {v.recommendation && <div className="text-muted-foreground">Rec: {v.recommendation}</div>}
                                </div>
                              ))}
                            </ActivitySection>

                            <ActivitySection title="Dealer audits" icon={Store} empty="No dealer audits.">
                              {act.audits.map((a) => (
                                <div key={a.id} className="text-xs py-1.5 border-b border-border/40 last:border-0">
                                  <div className="font-medium">{a.dealer_name} <span className="text-muted-foreground font-normal">· {a.audit_date}</span></div>
                                  <div className="text-muted-foreground flex flex-wrap gap-x-3">
                                    <span>Signage: {a.signage_visible ? "✓" : "✗"}</span>
                                    <span>Stocked: {a.shelves_stocked ? "✓" : "✗"}</span>
                                    <span>Trained: {a.staff_trained ? "✓" : "✗"}</span>
                                    {a.rating != null && <span>Rating: {a.rating}/5</span>}
                                  </div>
                                  {a.notes && <div className="text-muted-foreground mt-0.5">{a.notes}</div>}
                                </div>
                              ))}
                            </ActivitySection>

                            <ActivitySection title="Farmer leads" icon={Users} empty="No leads captured.">
                              {act.leads.map((l) => (
                                <div key={l.id} className="text-xs py-1.5 border-b border-border/40 last:border-0">
                                  <div className="font-medium">
                                    {l.farmer_name}
                                    {l.phone && <span className="text-muted-foreground font-normal"> · {l.phone}</span>}
                                    <Badge variant="outline" className="ml-2 text-[10px] capitalize">{l.status}</Badge>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {[l.village, l.taluka, l.district, l.state].filter(Boolean).join(", ")}
                                    {l.land_size_acres && ` · ${l.land_size_acres} ac`}
                                  </div>
                                  {l.crops?.length > 0 && <div className="text-muted-foreground">Crops: {l.crops.join(", ")}</div>}
                                  {l.notes && <div className="text-muted-foreground">{l.notes}</div>}
                                </div>
                              ))}
                            </ActivitySection>

                            <ActivitySection title="Recent attendance" icon={ClipboardList} empty="No attendance records.">
                              {act.attendance.map((at) => (
                                <div key={at.id} className="text-xs py-1.5 border-b border-border/40 last:border-0 flex justify-between gap-2">
                                  <span>{new Date(at.check_in_at).toLocaleString()}</span>
                                  <span className="text-muted-foreground">{at.check_out_at ? `→ ${new Date(at.check_out_at).toLocaleTimeString()}` : "active"}</span>
                                </div>
                              ))}
                            </ActivitySection>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ActivitySection = ({ title, icon: Icon, empty, children }: { title: string; icon: any; empty: string; children: React.ReactNode }) => {
  const arr = Array.isArray(children) ? children : [children];
  const hasItems = arr.filter(Boolean).length > 0;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
        <Icon className="h-3 w-3 text-primary" /> {title}
      </div>
      {hasItems ? <div>{children}</div> : <p className="text-xs text-muted-foreground italic">{empty}</p>}
    </div>
  );
};

export default AdminFieldOfficersManager;