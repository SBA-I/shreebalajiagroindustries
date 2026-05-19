import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import EmptyState from "@/components/ui/empty-state";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))"];

const monthKey = (d: string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [invoiceTrend, setInvoiceTrend] = useState<{ month: string; invoices: number }[]>([]);
  const [visitTrend, setVisitTrend] = useState<{ month: string; visits: number; audits: number }[]>([]);
  const [topDealers, setTopDealers] = useState<{ name: string; count: number }[]>([]);
  const [leadStatus, setLeadStatus] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString().slice(0, 10);

      const [inv, vis, aud, dealersInv, leads] = await Promise.all([
        supabase.from("dealer_invoices").select("invoice_date, dealer_id").gte("invoice_date", sixMonthsAgo),
        supabase.from("field_visits").select("visit_date").gte("visit_date", sixMonthsAgo),
        supabase.from("dealer_audits").select("audit_date").gte("audit_date", sixMonthsAgo),
        supabase.from("dealer_invoices").select("dealer_id"),
        supabase.from("farmer_leads").select("status"),
      ]);

      // Invoice monthly trend
      const invMap: Record<string, number> = {};
      (inv.data ?? []).forEach((r: any) => { const k = monthKey(r.invoice_date); invMap[k] = (invMap[k] ?? 0) + 1; });
      const invSeries = Object.entries(invMap).sort().map(([month, invoices]) => ({ month, invoices }));
      setInvoiceTrend(invSeries);

      // Visits + audits combined
      const vMap: Record<string, { visits: number; audits: number }> = {};
      (vis.data ?? []).forEach((r: any) => { const k = monthKey(r.visit_date); (vMap[k] ||= { visits: 0, audits: 0 }).visits++; });
      (aud.data ?? []).forEach((r: any) => { const k = monthKey(r.audit_date); (vMap[k] ||= { visits: 0, audits: 0 }).audits++; });
      setVisitTrend(Object.entries(vMap).sort().map(([month, x]) => ({ month, ...x })));

      // Top dealers by invoice count
      const dCount: Record<string, number> = {};
      (dealersInv.data ?? []).forEach((r: any) => { dCount[r.dealer_id] = (dCount[r.dealer_id] ?? 0) + 1; });
      const dealerIds = Object.entries(dCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (dealerIds.length > 0) {
        const { data: ds } = await supabase.from("dealers").select("id,name").in("id", dealerIds.map(([id]) => id));
        const nameMap = Object.fromEntries((ds ?? []).map((d: any) => [d.id, d.name]));
        setTopDealers(dealerIds.map(([id, count]) => ({ name: nameMap[id] ?? "—", count })));
      }

      // Lead status breakdown
      const lMap: Record<string, number> = {};
      (leads.data ?? []).forEach((r: any) => { lMap[r.status] = (lMap[r.status] ?? 0) + 1; });
      setLeadStatus(Object.entries(lMap).map(([name, value]) => ({ name, value })));

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Invoices per month (last 6m)</CardTitle></CardHeader>
        <CardContent className="h-64">
          {invoiceTrend.length === 0 ? (
            <EmptyState title="No invoice data yet" description="Upload dealer invoices to see trends." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="invoices" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Field activity (visits + audits)</CardTitle></CardHeader>
        <CardContent className="h-64">
          {visitTrend.length === 0 ? (
            <EmptyState title="No field activity yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="audits" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Top 5 dealers by invoices</CardTitle></CardHeader>
        <CardContent className="h-64">
          {topDealers.length === 0 ? (
            <EmptyState title="No dealer activity yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDealers} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Lead pipeline</CardTitle></CardHeader>
        <CardContent className="h-64">
          {leadStatus.length === 0 ? (
            <EmptyState title="No leads logged yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {leadStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;