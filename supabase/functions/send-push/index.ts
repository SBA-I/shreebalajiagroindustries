import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const envInternal = Deno.env.get("INTERNAL_SECRET") ?? "";

    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:info@shreebalajiagroindustries.com";
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) return json({ error: "VAPID keys not configured" }, 500);

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

    const admin = createClient(supabaseUrl, serviceKey);

    // Auth: either internal secret (env), vault-stored trigger secret, or an admin user JWT
    const provided = req.headers.get("x-internal-secret") ?? "";
    let authorized = false;

    if (envInternal && provided === envInternal) {
      authorized = true;
      // Self-heal: keep vault entry in sync with env so DB triggers can call us
      await admin.rpc("set_push_internal_secret", { _secret: envInternal }).catch(() => null);
    }

    if (!authorized && provided) {
      const { data } = await admin.rpc("get_push_internal_secret");
      if (data && provided === data) authorized = true;
    }

    if (!authorized) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (authHeader.startsWith("Bearer ")) {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: u } = await userClient.auth.getUser();
        if (u?.user) {
          const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
          if ((roles ?? []).some((r: any) => r.role === "admin")) {
            authorized = true;
            if (envInternal) {
              await admin.rpc("set_push_internal_secret", { _secret: envInternal }).catch(() => null);
            }
          }
        }
      }
    }

    if (!authorized) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({} as any));
    const { user_id, role, title, body: msg, url } = body ?? {};
    if (!title) return json({ error: "title required" }, 400);

    // Collect target subscriptions
    let query = admin.from("push_subscriptions").select("id, endpoint, p256dh, auth, user_id");
    if (user_id) {
      query = query.eq("user_id", user_id);
    } else if (role) {
      const { data: roleUsers } = await admin.from("user_roles").select("user_id").eq("role", role);
      const ids = (roleUsers ?? []).map((r: any) => r.user_id);
      if (ids.length === 0) return json({ ok: true, sent: 0 });
      query = query.in("user_id", ids);
    }
    const { data: subs, error } = await query;
    if (error) return json({ error: error.message }, 500);

    const payload = JSON.stringify({
      title,
      body: msg ?? "",
      url: url ?? "/dashboard",
    });

    let sent = 0;
    let removed = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err: any) {
        // 404/410 = subscription gone — clean up
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
          removed++;
        } else {
          console.error("push error", err?.statusCode, err?.body);
        }
      }
    }

    return json({ ok: true, sent, removed, total: subs?.length ?? 0 });
  } catch (e) {
    console.error("send-push error", e);
    return json({ error: (e as Error).message }, 500);
  }
});