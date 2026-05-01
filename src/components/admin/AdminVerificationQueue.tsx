import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, MapPin, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface PendingDealer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  shop_name: string | null;
  gst_number: string | null;
  license_number: string | null;
  shop_address: string | null;
  shop_lat: number | null;
  shop_lng: number | null;
  gst_document_url: string | null;
  license_document_url: string | null;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusBadge = (s: string) => {
  if (s === "approved") return "bg-primary text-primary-foreground";
  if (s === "rejected") return "bg-destructive text-destructive-foreground";
  return "bg-accent text-accent-foreground";
};

const AdminVerificationQueue = () => {
  const [tab, setTab] = useState<string>("pending");
  const [items, setItems] = useState<PendingDealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("requested_role", "distributor")
      .eq("verification_status", tab)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Failed to load queue");
      return;
    }
    setItems((data ?? []) as PendingDealer[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const viewDoc = async (path: string | null, key: string) => {
    if (!path) return;
    // Path may be a stored object key in 'dealer-documents' bucket
    const { data, error } = await supabase.storage
      .from("dealer-documents")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) {
      toast.error("Could not generate document link");
      return;
    }
    setSignedUrls((s) => ({ ...s, [key]: data.signedUrl }));
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        verification_notes: notesById[id] ?? null,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Dealer approved — distributor role granted." : "Dealer rejected.");
    load();
  };

  const filtered = items.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (i.shop_name ?? "").toLowerCase().includes(q) ||
      (i.full_name ?? "").toLowerCase().includes(q) ||
      (i.gst_number ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search shop, name or GST…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
          No {tab} dealer applications.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-semibold">{d.shop_name || "—"}</h3>
                    <p className="text-xs text-muted-foreground">
                      Owner: {d.full_name ?? "—"} · {d.phone ?? "no phone"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(d.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <Badge className={statusBadge(d.verification_status)}>{d.verification_status}</Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">GST Number</div>
                    <div className="font-mono">{d.gst_number || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">License</div>
                    <div className="font-mono">{d.license_number || "—"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground">Address</div>
                    <div>{d.shop_address || "—"}</div>
                    {d.shop_lat && d.shop_lng && (
                      <a
                        className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                        href={`https://www.google.com/maps?q=${d.shop_lat},${d.shop_lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MapPin className="h-3 w-3" /> {d.shop_lat}, {d.shop_lng}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {d.gst_document_url && (
                    <Button size="sm" variant="outline" onClick={() => viewDoc(d.gst_document_url, `gst-${d.id}`)}>
                      <FileText className="h-4 w-4" /> GST Cert
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {d.license_document_url && (
                    <Button size="sm" variant="outline" onClick={() => viewDoc(d.license_document_url, `lic-${d.id}`)}>
                      <FileText className="h-4 w-4" /> License
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {tab === "pending" && (
                  <>
                    <div>
                      <Label className="text-xs">Review notes (optional)</Label>
                      <Textarea
                        rows={2}
                        value={notesById[d.id] ?? ""}
                        onChange={(e) => setNotesById((n) => ({ ...n, [d.id]: e.target.value }))}
                        placeholder="Reason for rejection or note for our records"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decide(d.id, "approved")} disabled={busyId === d.id}>
                        {busyId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => decide(d.id, "rejected")} disabled={busyId === d.id}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </>
                )}

                {tab !== "pending" && d.verification_notes && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                    Note: {d.verification_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerificationQueue;