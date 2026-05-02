import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// When a user signs in with Google on the distributor / field_officer portal,
// they end up on a fresh auth.users row that has no role yet. If an admin has
// already approved a profile for the SAME email (via email/password signup or
// admin-create-dealer), we copy that approval onto the new OAuth user so they
// can enter the portal.
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

    const { requested_role } = (await req.json().catch(() => ({}))) as {
      requested_role?: "distributor" | "field_officer";
    };
    if (!requested_role || !["distributor", "field_officer"].includes(requested_role)) {
      return new Response(JSON.stringify({ error: "requested_role required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = userData.user.email?.toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ linked: false, reason: "no email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Find any APPROVED profile (different user_id) with the same email and the requested role.
    const { data: list } = await admin.auth.admin.listUsers();
    const match = (list?.users ?? []).find(
      (u) =>
        u.id !== userData.user!.id &&
        (u.email?.toLowerCase() === email),
    );
    if (!match) {
      return new Response(JSON.stringify({ linked: false, reason: "no matching account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: matchProfile } = await admin
      .from("profiles")
      .select("verification_status, requested_role, full_name, phone, shop_name, gst_number, license_number, shop_address, state, district, taluka, shop_lat, shop_lng, employee_id, assigned_territory")
      .eq("user_id", match.id)
      .maybeSingle();

    if (
      !matchProfile ||
      matchProfile.verification_status !== "approved" ||
      matchProfile.requested_role !== requested_role
    ) {
      return new Response(JSON.stringify({ linked: false, reason: "matching account not approved for this role" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert profile for the OAuth user with the same approved data.
    const { data: existingProfile } = await admin
      .from("profiles").select("user_id").eq("user_id", userData.user.id).maybeSingle();

    const profilePayload: Record<string, unknown> = {
      user_id: userData.user.id,
      full_name: matchProfile.full_name ?? userData.user.user_metadata?.full_name ?? email,
      phone: matchProfile.phone,
      requested_role,
      shop_name: matchProfile.shop_name,
      gst_number: matchProfile.gst_number,
      license_number: matchProfile.license_number,
      shop_address: matchProfile.shop_address,
      state: matchProfile.state,
      district: matchProfile.district,
      taluka: matchProfile.taluka,
      shop_lat: matchProfile.shop_lat,
      shop_lng: matchProfile.shop_lng,
      employee_id: matchProfile.employee_id,
      assigned_territory: matchProfile.assigned_territory,
      verification_status: "approved",
    };

    if (existingProfile) {
      await admin.from("profiles").update(profilePayload).eq("user_id", userData.user.id);
    } else {
      await admin.from("profiles").insert(profilePayload);
    }

    // Grant the role
    await admin.from("user_roles").insert({
      user_id: userData.user.id, role: requested_role,
    }).select();

    // Re-point dealer record (if any) to the new user_id so portal data continues to work.
    if (requested_role === "distributor") {
      await admin.from("dealers").update({ user_id: userData.user.id }).eq("user_id", match.id);
    }

    return new Response(JSON.stringify({ ok: true, linked: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});