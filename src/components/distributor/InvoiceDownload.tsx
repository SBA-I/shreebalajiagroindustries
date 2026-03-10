import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { calculateGST, COMPANY_GSTIN, GST_RATE, getStateFromGSTIN } from "@/lib/gst-utils";

interface InvoiceDownloadProps {
  order: {
    order_number: string;
    created_at: string;
    total: number;
    status: string;
    delivery_date?: string | null;
    notes?: string | null;
    order_items?: Array<{
      product_name: string;
      quantity: number;
      unit: string;
      price: number;
    }>;
  };
}

const InvoiceDownload = ({ order }: InvoiceDownloadProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["invoice-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handleDownload = () => {
    const items = order.order_items ?? [];
    const date = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });

    const subtotal = items.reduce((s, i) => s + i.quantity * Number(i.price), 0);
    const gst = calculateGST(subtotal, profile?.gst_number ?? "");
    const companyState = getStateFromGSTIN(COMPANY_GSTIN);
    const distState = getStateFromGSTIN(profile?.gst_number ?? "");

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Tax Invoice ${order.order_number}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #166534; }
  .company h1 { font-size: 22px; color: #166534; margin: 0 0 4px 0; }
  .company p { font-size: 11px; color: #666; margin: 2px 0; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 28px; color: #166534; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 3px; }
  .invoice-title p { font-size: 11px; color: #666; margin: 2px 0; }
  .parties { display: flex; justify-content: space-between; margin-bottom: 24px; }
  .parties .box { width: 48%; padding: 12px; background: #f0fdf4; border-radius: 8px; }
  .parties .box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #166534; margin: 0 0 8px 0; }
  .parties .box p { margin: 2px 0; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #166534; color: #fff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  .text-right { text-align: right; }
  .summary { margin-left: auto; width: 320px; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .summary-row.total { border-top: 2px solid #166534; font-size: 16px; font-weight: 700; color: #166534; padding-top: 10px; margin-top: 4px; }
  .gst-label { color: #666; }
  .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .footer .sig { text-align: right; margin-top: 40px; }
  .footer .sig p { margin: 0; }
  .terms { font-size: 10px; color: #999; margin-top: 30px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
  .badge-delivered { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-other { background: #e0e7ff; color: #3730a3; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div class="company">
    <h1>Shree Balaji Agro Industries</h1>
    <p>Manufacturer of Quality Agrochemicals</p>
    <p>GSTIN: ${COMPANY_GSTIN}</p>
    <p>State: ${companyState?.name ?? "Maharashtra"} (${companyState?.code ?? "27"})</p>
  </div>
  <div class="invoice-title">
    <h2>Tax Invoice</h2>
    <p><strong>Invoice No:</strong> ${order.order_number}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Status:</strong> <span class="badge ${order.status === 'delivered' ? 'badge-delivered' : order.status === 'pending' ? 'badge-pending' : 'badge-other'}">${order.status}</span></p>
    ${order.delivery_date ? `<p><strong>Delivery:</strong> ${new Date(order.delivery_date).toLocaleDateString("en-IN")}</p>` : ""}
  </div>
</div>

<div class="parties">
  <div class="box">
    <h3>Seller</h3>
    <p><strong>Shree Balaji Agro Industries</strong></p>
    <p>GSTIN: ${COMPANY_GSTIN}</p>
    <p>State: ${companyState?.name ?? "Maharashtra"}</p>
  </div>
  <div class="box">
    <h3>Buyer (Distributor)</h3>
    <p><strong>${profile?.company_name || profile?.full_name || "—"}</strong></p>
    ${profile?.gst_number ? `<p>GSTIN: ${profile.gst_number}</p>` : ""}
    ${distState ? `<p>State: ${distState.name} (${distState.code})</p>` : (profile?.state ? `<p>State: ${profile.state}</p>` : "")}
    ${profile?.address ? `<p>${profile.address}${profile.city ? `, ${profile.city}` : ""}${profile.pincode ? ` - ${profile.pincode}` : ""}</p>` : ""}
    ${profile?.phone ? `<p>Phone: ${profile.phone}</p>` : ""}
  </div>
</div>

<table>
  <thead><tr>
    <th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th class="text-right">Rate (₹)</th><th class="text-right">Amount (₹)</th>
  </tr></thead>
  <tbody>
    ${items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td class="text-right">${Number(item.price).toLocaleString("en-IN")}</td>
        <td class="text-right">${(item.quantity * Number(item.price)).toLocaleString("en-IN")}</td>
      </tr>`).join("")}
  </tbody>
</table>

<div class="summary">
  <div class="summary-row"><span class="gst-label">Subtotal</span><span>₹${gst.subtotal.toLocaleString("en-IN")}</span></div>
  ${gst.isIntraState ? `
    <div class="summary-row"><span class="gst-label">CGST @ ${GST_RATE / 2}%</span><span>₹${gst.cgst.toLocaleString("en-IN")}</span></div>
    <div class="summary-row"><span class="gst-label">SGST @ ${GST_RATE / 2}%</span><span>₹${gst.sgst.toLocaleString("en-IN")}</span></div>
  ` : `
    <div class="summary-row"><span class="gst-label">IGST @ ${GST_RATE}%</span><span>₹${gst.igst.toLocaleString("en-IN")}</span></div>
  `}
  <div class="summary-row total"><span>Grand Total</span><span>₹${gst.grandTotal.toLocaleString("en-IN")}</span></div>
</div>

<div class="footer">
  <div class="sig">
    <p><strong>For Shree Balaji Agro Industries</strong></p>
    <br/><br/>
    <p>Authorized Signatory</p>
  </div>
</div>

<div class="terms">
  <p><strong>Terms & Conditions:</strong></p>
  <p>1. Goods once sold will not be taken back. 2. Payment due within 30 days. 3. Interest @18% p.a. will be charged on delayed payments.</p>
  <p>4. Subject to local jurisdiction. 5. E&OE.</p>
  <p style="margin-top:10px;text-align:center;">This is a computer-generated invoice. Thank you for your business! 🌾</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
      <Download className="h-3.5 w-3.5" /> GST Invoice
    </Button>
  );
};

export default InvoiceDownload;
