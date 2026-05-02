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
      employee_id, assigned_territory, state, district, taluka,
    } = body ?? {};

    if (!email || !password || !full_name || !phone) {
      return new Response(JSON.stringify({ error: "email, password, full_name, phone required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the auth user with email auto-confirmed (admin-created accounts)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: {
        full_name, phone,
        requested_role: "field_officer",
        employee_id, assigned_territory,
        state, district, taluka,
      },
    });
    if (createErr || !created.user) {
      const raw = createErr?.message ?? "Failed to create user";
      const friendly =
        raw.toLowerCase().includes("already")
          ? `A user with email "${email}" already exists. Use a different email, or remove the existing account first (Users tab).`
          : raw;
      return new Response(JSON.stringify({ error: friendly }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = created.user.id;

    // handle_new_user trigger inserts profile with verification_status='pending'.
    // Admin-created field officers should be approved immediately.
    await admin.from("profiles").update({
      verification_status: "approved",
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("user_id", newUserId);

    // Make sure the role is granted (the approval trigger handles this, but be safe)
    await admin.from("user_roles")
      .insert({ user_id: newUserId, role: "field_officer" })
      .select();

    return new Response(JSON.stringify({ ok: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});