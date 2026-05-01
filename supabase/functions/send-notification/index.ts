import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Internal shared-secret authentication: this function uses the service role
    // key which bypasses RLS, so it must only be callable by trusted server-side code.
    const internalSecret = Deno.env.get("INTERNAL_SECRET");
    const providedSecret = req.headers.get("x-internal-secret");
    if (!internalSecret || providedSecret !== internalSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, order_id, user_id } = await req.json();

    if (type === "order_status_changed") {
      // Fetch order details
      const { data: order } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", order_id)
        .single();

      if (!order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", order.user_id)
        .single();

      // Create in-app notification message
      await supabase.from("messages").insert({
        user_id: order.user_id,
        from_name: "Order System",
        subject: `Order ${order.order_number} status: ${order.status}`,
        preview: `Your order ${order.order_number} has been updated to "${order.status}".`,
        body: `Dear ${profile?.full_name || "Customer"},\n\nYour order ${order.order_number} (₹${Number(order.total).toLocaleString()}) has been updated to "${order.status}".\n\nItems: ${order.order_items?.map((i: any) => `${i.product_name} x${i.quantity}`).join(", ")}\n\nThank you for your business.\n\nSB Agrochemicals`,
        type: "order",
        read: false,
      });

      return new Response(
        JSON.stringify({ success: true, message: "Notification sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "low_stock_alert") {
      // Check all inventory for low stock
      const { data: lowStock } = await supabase
        .from("inventory")
        .select("*, products(name, category)")
        .filter("current_stock", "lt", "min_stock");

      // This would need a raw SQL or RPC approach; let's use a simpler check
      const { data: inventory } = await supabase
        .from("inventory")
        .select("*");

      const lowItems = (inventory || []).filter((i) => i.current_stock < i.min_stock);

      if (lowItems.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No low stock items" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get unique distributor IDs
      const distributorIds = [...new Set(lowItems.map((i) => i.distributor_id))];

      for (const distributorId of distributorIds) {
        const items = lowItems.filter((i) => i.distributor_id === distributorId);
        const itemList = items.map((i) => `• Product ${i.product_id}: ${i.current_stock}/${i.min_stock} ${i.unit}`).join("\n");

        await supabase.from("messages").insert({
          user_id: distributorId,
          from_name: "Inventory System",
          subject: `⚠️ Low Stock Alert: ${items.length} item(s) below minimum`,
          preview: `${items.length} products are below minimum stock level and need reordering.`,
          body: `Dear Distributor,\n\nThe following items are below minimum stock levels:\n\n${itemList}\n\nPlease place reorders promptly to avoid stockouts.\n\nSB Agrochemicals`,
          type: "announcement",
          read: false,
        });
      }

      return new Response(
        JSON.stringify({ success: true, alerts_sent: distributorIds.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown notification type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-notification error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
