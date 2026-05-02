import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, FileText, Download, Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Invoice {
  id: string; invoice_number: string; invoice_date: string;
  product_summary: string | null; quantity_summary: string | null;
  status: string; pdf_url: string;
}

const STATUS_LABEL: Record<string, string> = {
  dispatched: "Dispatched",
  delivered: "Delivered",
  returns_processed: "Returns Processed",
};
const STATUS_TONE: Record<string, string> = {
  dispatched: "bg-amber-100 text-amber-800",
  delivered: "bg-primary/10 text-primary",
  returns_processed: "bg-muted text-muted-foreground",
};

const DistributorPortal = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: dealers } = await supabase.from("dealers").select("id").eq("user_id", user.id);
      const ids = (dealers ?? []).map((d) => d.id);
      if (ids.length === 0) { setInvoices([]); setLoading(false); return; }
      const { data } = await supabase
        .from("dealer_invoices")
        .select("id,invoice_number,invoice_date,product_summary,quantity_summary,status,pdf_url")
        .in("dealer_id", ids)
        .order("invoice_date", { ascending: false });
      setInvoices((data ?? []) as Invoice[]);
      setLoading(false);
    })();
  }, [user]);

  const download = async (inv: Invoice) => {
    setDownloading(inv.id);
    const { data, error } = await supabase.storage.from("dealer-invoices").createSignedUrl(inv.pdf_url, 300);
    setDownloading(null);
    if (error || !data) return toast.error("Could not generate download link");
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Layout>
      <section className="bg-primary py-10">
        <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
          <Store className="h-7 w-7 text-primary-foreground" />
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">Dealer Portal</h1>
            <p className="text-primary-foreground/80 text-sm">Logistics records, shipment invoices, and stock challans.</p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Shipment Invoices &amp; Challans
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Stock-received records uploaded by Shree Balaji Agro Industries. Use for GST filing and inventory reconciliation.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                  No invoices yet. Once Balaji dispatches stock to your shop, the challan PDF will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground border-b">
                      <tr className="text-left">
                        <th className="py-2 pr-2">Date</th>
                        <th className="py-2 pr-2">Invoice No.</th>
                        <th className="py-2 pr-2">Products</th>
                        <th className="py-2 pr-2">Quantity</th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2 pr-2 text-right">Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-3 pr-2 whitespace-nowrap">{inv.invoice_date}</td>
                          <td className="py-3 pr-2 font-medium">{inv.invoice_number}</td>
                          <td className="py-3 pr-2 text-muted-foreground">{inv.product_summary ?? "—"}</td>
                          <td className="py-3 pr-2 text-muted-foreground">{inv.quantity_summary ?? "—"}</td>
                          <td className="py-3 pr-2">
                            <Badge className={STATUS_TONE[inv.status] ?? "bg-muted text-muted-foreground"}>
                              {STATUS_LABEL[inv.status] ?? inv.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => download(inv)} disabled={downloading === inv.id}>
                              {downloading === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                              PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default DistributorPortal;