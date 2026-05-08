import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Store, MapPin, ClipboardList, MessageSquare, Loader2, TrendingUp, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  farmers: number;
  distributors: number;
  field_officers: number;
  pendingVerifications: number;
  visitsToday: number;
  auditsToday: number;
  newLeads7d: number;
  openInquiries: number;
  subscribers: number;
};

const KPI = ({ icon: Icon, label, value, hint, accent }: any) => (
  <Card>
    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} />
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

      const [
        farmers, distributors, officers, pending, visits, audits, leads, inquiries, subs, recent,
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "farmer"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "distributor"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "field_officer"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("field_visits").select("*", { count: "exact", head: true }).gte("visit_date", todayStart.toISOString().slice(0, 10)),
        supabase.from("dealer_audits").select("*", { count: "exact", head: true }).gte("audit_date", todayStart.toISOString().slice(0, 10)),
        supabase.from("farmer_leads").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("contact_inquiries").select("*", { count: "exact", head: true }).eq("is_resolved", false),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("contact_inquiries").select("id,name,inquiry_type,message,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        farmers: farmers.count ?? 0,
        distributors: distributors.count ?? 0,
        field_officers: officers.count ?? 0,
        pendingVerifications: pending.count ?? 0,
        visitsToday: visits.count ?? 0,
        auditsToday: audits.count ?? 0,
        newLeads7d: leads.count ?? 0,
        openInquiries: inquiries.count ?? 0,
        subscribers: subs.count ?? 0,
      });
      setRecentInquiries(recent.data ?? []);
    })();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPI icon={Users} label="Farmers" value={stats.farmers} hint="Total registered" />
        <KPI icon={Store} label="Distributors" value={stats.distributors} hint="Approved dealers" />
        <KPI icon={UserCheck} label="Field Officers" value={stats.field_officers} hint="Active" />
        <KPI icon={UserCheck} label="Pending Verifications" value={stats.pendingVerifications} hint="Need review" accent="text-yellow-600" />
        <KPI icon={MapPin} label="Visits Today" value={stats.visitsToday} hint="Field activity" />
        <KPI icon={ClipboardList} label="Audits Today" value={stats.auditsToday} hint="Dealer audits" />
        <KPI icon={TrendingUp} label="New Leads (7d)" value={stats.newLeads7d} hint="Farmer leads" />
        <KPI icon={MessageSquare} label="Open Inquiries" value={stats.openInquiries} hint="Unresolved" accent="text-destructive" />
        <KPI icon={Mail} label="Subscribers" value={stats.subscribers} hint="Newsletter" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentInquiries.map((q) => (
                <li key={q.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{q.name} <span className="text-xs text-muted-foreground font-normal">· {q.inquiry_type}</span></p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{q.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(q.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;