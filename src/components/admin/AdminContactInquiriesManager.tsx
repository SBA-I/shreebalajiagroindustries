import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Check, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  message: string;
  is_resolved: boolean;
}

const AdminContactInquiriesManager = () => {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Inquiry[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const toggleResolved = async (i: Inquiry) => {
    const { error } = await supabase.from("contact_inquiries").update({ is_resolved: !i.is_resolved }).eq("id", i.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("contact_inquiries").delete().eq("id", id);
    refresh();
  };

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "resolved" ? r.is_resolved : !r.is_resolved
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle className="text-base">Contact Inquiries ({rows.length})</CardTitle>
        <div className="flex gap-1">
          {(["open", "resolved", "all"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No {filter !== "all" ? filter : ""} inquiries.</p>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((i) => (
              <div key={i.id} className="py-3 space-y-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{i.name} <span className="text-xs text-muted-foreground font-normal">· {new Date(i.created_at).toLocaleString()}</span></p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${i.email}`} className="hover:underline">{i.email}</a>
                      {i.phone && (
                        <>
                          <span className="mx-1">·</span>
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${i.phone}`} className="hover:underline">{i.phone}</a>
                        </>
                      )}
                      <Badge variant="outline" className="ml-1 capitalize">{i.inquiry_type}</Badge>
                      {i.is_resolved && <Badge className="bg-primary/15 text-primary">Resolved</Badge>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => toggleResolved(i)} className="gap-1.5">
                      <Check className="h-3.5 w-3.5" /> {i.is_resolved ? "Reopen" : "Resolve"}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground/90 bg-muted/40 rounded p-2">{i.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContactInquiriesManager;