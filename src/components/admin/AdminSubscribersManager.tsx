import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Sub {
  id: string;
  email: string;
  source: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminSubscribersManager = () => {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, source, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Sub[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    toast.success("Removed");
    refresh();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !current, unsubscribed_at: current ? new Date().toISOString() : null })
      .eq("id", id);
    refresh();
  };

  const exportCsv = () => {
    const csv = ["email,source,active,created_at", ...rows.map((r) =>
      [r.email, r.source ?? "", r.is_active, r.created_at].join(","),
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const active = rows.filter((r) => r.is_active).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Newsletter subscribers ({active} active / {rows.length} total)
        </CardTitle>
        <Button size="sm" variant="outline" onClick={exportCsv} className="gap-1.5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.source ?? "—"} · {new Date(r.created_at).toLocaleDateString()} · {r.is_active ? "Active" : "Unsubscribed"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(r.id, r.is_active)}>
                    {r.is_active ? "Unsubscribe" : "Reactivate"}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSubscribersManager;