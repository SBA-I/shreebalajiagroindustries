import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, Phone, Download, Package, CheckCircle2, Circle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Shipment {
  id: string;
  tracking_number: string;
  stage: string;
  status: string;
  lr_number: string | null;
  transport_company: string | null;
  carrier: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  destination_city: string;
  destination_state: string;
  product_summary: string | null;
  quantity_summary: string | null;
  expected_delivery_at: string | null;
  delivered_at: string | null;
  dispatched_at: string | null;
  created_at: string;
  challan_url: string | null;
  notes: string | null;
}

const STAGES = [
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "being_packed", label: "Being Packed" },
  { key: "dispatched", label: "Dispatched from Dhule" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "received", label: "Received" },
] as const;

const stageIndex = (s: string) => {
  const i = STAGES.findIndex((x) => x.key === s);
  return i < 0 ? 0 : i;
};

const PackageTracker = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: dealers } = await supabase.from("dealers").select("id").eq("user_id", user.id);
      const ids = (dealers ?? []).map((d) => d.id);
      if (ids.length === 0) { setShipments([]); setLoading(false); return; }
      const { data, error } = await supabase
        .from("dispatches")
        .select("*")
        .in("dealer_id", ids)
        .order("created_at", { ascending: false });
      if (error) toast.error("Could not load shipments");
      setShipments((data ?? []) as Shipment[]);
      setLoading(false);
    })();
  }, [user]);

  const downloadChallan = async (path: string) => {
    const { data, error } = await supabase.storage.from("dealer-invoices").createSignedUrl(path, 300);
    if (error || !data) return toast.error("Could not generate download link");
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Live Shipments
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Track stock from the Dhule factory to your shop. No payments — pure logistics.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
            No active shipments. New dispatches from Shree Balaji Agro will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {shipments.map((s) => <ShipmentCard key={s.id} s={s} onDownload={downloadChallan} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ShipmentCard = ({ s, onDownload }: { s: Shipment; onDownload: (p: string) => void }) => {
  const idx = stageIndex(s.stage);
  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground">Tracking #</p>
          <p className="font-mono font-semibold">{s.tracking_number}</p>
          <p className="text-xs text-muted-foreground mt-1">
            To {s.destination_city}, {s.destination_state}
          </p>
        </div>
        <div className="text-right">
          {s.expected_delivery_at && (
            <Badge variant="outline" className="text-xs">
              ETA {new Date(s.expected_delivery_at).toLocaleDateString()}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Created {new Date(s.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {STAGES.map((st, i) => {
          const done = i <= idx;
          const current = i === idx;
          return (
            <li key={st.key} className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                {done ? (
                  <CheckCircle2 className={`h-5 w-5 ${current ? "text-primary" : "text-primary/70"}`} />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                {i < STAGES.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[12px] ${i < idx ? "bg-primary/60" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-2">
                <p className={`text-sm ${current ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                  {st.label}
                </p>
                {current && st.key === "dispatched" && s.dispatched_at && (
                  <p className="text-xs text-muted-foreground">{new Date(s.dispatched_at).toLocaleString()}</p>
                )}
                {current && st.key === "received" && s.delivered_at && (
                  <p className="text-xs text-muted-foreground">{new Date(s.delivered_at).toLocaleString()}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border">
        <Detail label="LR Number" value={s.lr_number} />
        <Detail label="Transport" value={s.transport_company || s.carrier} />
        <Detail label="Driver" value={s.driver_name} />
        <Detail label="Driver Phone" value={s.driver_phone} action={
          s.driver_phone ? (
            <a href={`tel:${s.driver_phone}`} className="text-primary inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> Call
            </a>
          ) : null
        } />
        <Detail label="Products" value={s.product_summary} />
        <Detail label="Quantity" value={s.quantity_summary} />
      </div>

      {s.challan_url && (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onDownload(s.challan_url!)}>
          <Download className="h-3.5 w-3.5" /> Delivery Challan
        </Button>
      )}
      {s.notes && (
        <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 flex gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {s.notes}
        </p>
      )}
    </div>
  );
};

const Detail = ({ label, value, action }: { label: string; value: string | null | undefined; action?: React.ReactNode }) => (
  <div>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground flex items-center gap-2">
      {value || <span className="text-muted-foreground/60">—</span>}
      {action}
    </p>
  </div>
);

export default PackageTracker;
