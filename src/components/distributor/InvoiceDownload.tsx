import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  const handleDownload = () => {
    const items = order.order_items ?? [];
    const date = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${order.order_number}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .company { }
  .company h1 { font-size: 22px; color: #166534; margin: 0 0 4px 0; }
  .company p { font-size: 12px; color: #666; margin: 2px 0; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 28px; color: #166534; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px; }
  .invoice-meta p { font-size: 12px; color: #666; margin: 2px 0; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge-delivered { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-other { background: #e0e7ff; color: #3730a3; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f0fdf4; color: #166534; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #166534; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
  .text-right { text-align: right; }
  .total-row { background: #f0fdf4; }
  .total-row td { font-weight: 700; font-size: 15px; color: #166534; border-bottom: 2px solid #166534; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #999; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div class="company">
    <h1>Shree Balaji Agro Industries</h1>
    <p>Manufacturer of Quality Agrochemicals</p>
    <p>GSTIN: XXXXXXXXXXXX</p>
  </div>
  <div class="invoice-meta">
    <h2>Invoice</h2>
    <p><strong>${order.order_number}</strong></p>
    <p>Date: ${date}</p>
    <p>Status: <span class="badge ${order.status === 'delivered' ? 'badge-delivered' : order.status === 'pending' ? 'badge-pending' : 'badge-other'}">${order.status}</span></p>
    ${order.delivery_date ? `<p>Delivery: ${new Date(order.delivery_date).toLocaleDateString("en-IN")}</p>` : ""}
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
    <tr class="total-row">
      <td colspan="5" class="text-right">Grand Total</td>
      <td class="text-right">₹${Number(order.total).toLocaleString("en-IN")}</td>
    </tr>
  </tbody>
</table>
${order.notes ? `<p style="font-size:12px;color:#666;margin-top:8px;"><strong>Notes:</strong> ${order.notes}</p>` : ""}
<div class="footer">
  <p>This is a computer-generated invoice. Thank you for your business!</p>
  <p>Shree Balaji Agro Industries — Quality Products for Better Yield 🌾</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
      <Download className="h-3.5 w-3.5" /> Invoice
    </Button>
  );
};

export default InvoiceDownload;
