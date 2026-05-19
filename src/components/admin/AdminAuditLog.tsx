import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/ui/empty-state";

interface Entry {
  id: string;
  admin_name: string | null;
  action: string;
  target_type: string;
  target_label: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const actionTone = (action: string) => {
  if (action.includes("delete") || action.includes("rejected") || action.includes("revoked")) return "bg-destructive/10 text-destructive";
  if (action.includes("approved") || action.includes("granted") || action.includes("reactivated")) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
};

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setEntries((data ?? []) as Entry[]);
      setLoading(false);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4" /> Admin Audit Log ({entries.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <EmptyState icon={ScrollText} title="No admin actions yet" description="Sensitive admin actions are recorded here for accountability." />
        ) : (
          <div className="divide-y divide-border">
            {entries.map((e) => (
              <div key={e.id} className="py-3 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${actionTone(e.action)} text-[10px] capitalize`}>{e.action.replace(/[._]/g, " ")}</Badge>
                    <span className="text-sm font-medium">{e.target_label || e.target_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {e.admin_name || "admin"} · {new Date(e.created_at).toLocaleString()}
                  </p>
                  {e.details && Object.keys(e.details).length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono break-all">
                      {Object.entries(e.details).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAuditLog;