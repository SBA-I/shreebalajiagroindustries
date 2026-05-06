import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OfficerLite { user_id: string; full_name: string | null; employee_id: string | null; }

const useOfficers = () => {
  const [map, setMap] = useState<Record<string, OfficerLite>>({});
  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "field_officer");
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (!ids.length) return;
      const { data } = await supabase.from("profiles").select("user_id, full_name, employee_id").in("user_id", ids);
      const m: Record<string, OfficerLite> = {};
      (data ?? []).forEach((p: any) => { m[p.user_id] = p; });
      setMap(m);
    })();
  }, []);
  return map;
};

const officerLabel = (m: Record<string, OfficerLite>, id: string) => {
  const p = m[id];
  if (!p) return id.slice(0, 8);
  return `${p.full_name ?? "Officer"}${p.employee_id ? ` (${p.employee_id})` : ""}`;
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

const VisitsList = ({ officers, search }: { officers: Record<string, OfficerLite>; search: string }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("field_visits").select("*").order("visit_date", { ascending: false }).limit(500)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  const filtered = rows.filter((r) => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto my-6" />;
  if (!filtered.length) return <p className="text-sm text-muted-foreground py-6 text-center">No visits.</p>;
  return (
    <div className="divide-y divide-border">
      {filtered.map((r) => (
        <div key={r.id} className="py-3 text-sm space-y-0.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-medium">{r.farmer_name} <span className="text-xs text-muted-foreground">· {fmtDate(r.visit_date)}</span></p>
            <Badge variant="outline" className="text-[10px]">{officerLabel(officers, r.officer_id)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{[r.village, r.district, r.state].filter(Boolean).join(", ")} · {r.crop ?? "—"} · {r.acreage ?? "—"} ac</p>
          {r.observations && <p className="text-xs"><b>Obs:</b> {r.observations}</p>}
          {r.recommendation && <p className="text-xs"><b>Reco:</b> {r.recommendation}</p>}
          {r.lat && r.lng && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{r.lat},{r.lng}</p>}
        </div>
      ))}
    </div>
  );
};

const AuditsList = ({ officers, search }: { officers: Record<string, OfficerLite>; search: string }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("dealer_audits").select("*").order("audit_date", { ascending: false }).limit(500)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  const filtered = rows.filter((r) => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto my-6" />;
  if (!filtered.length) return <p className="text-sm text-muted-foreground py-6 text-center">No audits.</p>;
  return (
    <div className="divide-y divide-border">
      {filtered.map((r) => (
        <div key={r.id} className="py-3 text-sm space-y-0.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-medium">{r.dealer_name} <span className="text-xs text-muted-foreground">· {fmtDate(r.audit_date)}</span></p>
            <Badge variant="outline" className="text-[10px]">{officerLabel(officers, r.officer_id)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Stocked: {r.shelves_stocked ? "✅" : "❌"} · Signage: {r.signage_visible ? "✅" : "❌"} · Trained: {r.staff_trained ? "✅" : "❌"} · Material req: {r.marketing_material_needed ? "Yes" : "No"} · Rating: {r.rating ?? "—"}/5
          </p>
          {r.notes && <p className="text-xs">{r.notes}</p>}
        </div>
      ))}
    </div>
  );
};

const LeadsList = ({ officers, search }: { officers: Record<string, OfficerLite>; search: string }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("farmer_leads").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  const filtered = rows.filter((r) => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto my-6" />;
  if (!filtered.length) return <p className="text-sm text-muted-foreground py-6 text-center">No leads.</p>;
  return (
    <div className="divide-y divide-border">
      {filtered.map((r) => (
        <div key={r.id} className="py-3 text-sm space-y-0.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-medium">{r.farmer_name} <span className="text-xs text-muted-foreground">· {r.phone ?? "—"}</span></p>
            <Badge variant="outline" className="text-[10px]">{officerLabel(officers, r.officer_id)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{[r.village, r.taluka, r.district, r.state, r.pincode].filter(Boolean).join(", ")}</p>
          <p className="text-xs">Crops: {(r.crops ?? []).join(", ") || "—"} · Land: {r.land_size_acres ?? "—"} ac · Status: <Badge className="text-[10px]">{r.status}</Badge></p>
          {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
        </div>
      ))}
    </div>
  );
};

const AttendanceList = ({ officers, search }: { officers: Record<string, OfficerLite>; search: string }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("field_officer_attendance").select("*").order("check_in_at", { ascending: false }).limit(500)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  const filtered = rows.filter((r) => !search || officerLabel(officers, r.officer_id).toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto my-6" />;
  if (!filtered.length) return <p className="text-sm text-muted-foreground py-6 text-center">No attendance records.</p>;
  return (
    <div className="divide-y divide-border">
      {filtered.map((r) => (
        <div key={r.id} className="py-3 text-sm space-y-0.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-medium">{officerLabel(officers, r.officer_id)}</p>
            <Badge variant={r.check_out_at ? "outline" : "default"} className="text-[10px]">{r.check_out_at ? "Closed" : "Active"}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">In: {fmt(r.check_in_at)} · Out: {fmt(r.check_out_at)}</p>
          {(r.villages_covered?.length ?? 0) > 0 && <p className="text-xs">Villages: {r.villages_covered.join(", ")}</p>}
          {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
        </div>
      ))}
    </div>
  );
};

const AdminFieldActivityManager = () => {
  const officers = useOfficers();
  const [search, setSearch] = useState("");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-base">Field Officer Activity</CardTitle>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visits">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="audits">Dealer Audits</TabsTrigger>
            <TabsTrigger value="leads">Farmer Leads</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          <TabsContent value="visits"><VisitsList officers={officers} search={search} /></TabsContent>
          <TabsContent value="audits"><AuditsList officers={officers} search={search} /></TabsContent>
          <TabsContent value="leads"><LeadsList officers={officers} search={search} /></TabsContent>
          <TabsContent value="attendance"><AttendanceList officers={officers} search={search} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminFieldActivityManager;