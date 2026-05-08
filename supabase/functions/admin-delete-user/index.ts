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

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isAdmin = (roleRows ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't allow deleting yourself
    if (user_id === userData.user.id) {
      return new Response(JSON.stringify({ error: "You cannot delete your own admin account." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up dealer rows owned by this user so we can clean dependent rows
    const { data: dealerRows } = await admin
      .from("dealers")
      .select("id")
      .eq("user_id", user_id);
    const dealerIds = (dealerRows ?? []).map((d: any) => d.id);

    if (dealerIds.length > 0) {
      await admin.from("dealer_stock").delete().in("dealer_id", dealerIds);
      await admin.from("dealer_invoices").delete().in("dealer_id", dealerIds);
      await admin.from("dispatches").delete().in("dealer_id", dealerIds);
      await admin.from("dealer_audits").delete().in("dealer_id", dealerIds);
      await admin.from("farmer_leads").delete().in("linked_dealer_id", dealerIds);
    }

    // Field-officer-owned rows
    await admin.from("dealer_audits").delete().eq("officer_id", user_id);
    await admin.from("farmer_leads").delete().eq("officer_id", user_id);
    await admin.from("field_visits").delete().eq("officer_id", user_id);
    await admin.from("field_officer_attendance").delete().eq("officer_id", user_id);

    // Farmer-owned rows
    await admin.from("spray_logs").delete().eq("user_id", user_id);
    await admin.from("disease_scans").delete().eq("user_id", user_id);
    await admin.from("farmer_crops").delete().eq("user_id", user_id);
    await admin.from("inventory").delete().eq("distributor_id", user_id);

    // Notifications + dealer + roles + profile
    await admin.from("messages").delete().eq("user_id", user_id);
    await admin.from("dealers").delete().eq("user_id", user_id);
    await admin.from("user_roles").delete().eq("user_id", user_id);
    await admin.from("profiles").delete().eq("user_id", user_id);

    // Finally delete from auth — this is the actual account removal
    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr && !/not.?found/i.test(delErr.message)) throw delErr;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});