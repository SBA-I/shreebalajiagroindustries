import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRows } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id);
    const isAdmin = (roleRows ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      email, password, full_name, phone,
      shop_name, gst_number, license_number, shop_address,
      state, district, taluka, shop_lat, shop_lng,
      // extra dealer fields not on profile
      address_line, city, pincode, whatsapp, photo_url, shop_url,
    } = body ?? {};

    if (!email || !password || !full_name || !phone || !shop_name) {
      return new Response(JSON.stringify({ error: "email, password, full_name, phone, shop_name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: {
        full_name, phone,
        requested_role: "distributor",
        shop_name, gst_number, license_number, shop_address,
        state, district, taluka,
        shop_lat: shop_lat?.toString() ?? "",
        shop_lng: shop_lng?.toString() ?? "",
      },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Failed to create user" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = created.user.id;

    // Approve the profile — this triggers grant_role_on_approval, which:
    //   - inserts into user_roles (distributor)
    //   - inserts into dealers (auto from profile fields)
    await admin.from("profiles").update({
      verification_status: "approved",
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("user_id", newUserId);

    // Patch in the extra dealer fields the trigger doesn't know about
    const dealerPatch: Record<string, unknown> = {};
    if (address_line) dealerPatch.address_line = address_line;
    if (city) dealerPatch.city = city;
    if (pincode) dealerPatch.pincode = pincode;
    if (whatsapp) dealerPatch.whatsapp = whatsapp;
    if (photo_url) dealerPatch.photo_url = photo_url;
    if (shop_url) dealerPatch.shop_url = shop_url;
    if (Object.keys(dealerPatch).length > 0) {
      await admin.from("dealers").update(dealerPatch).eq("user_id", newUserId);
    }

    return new Response(JSON.stringify({ ok: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});