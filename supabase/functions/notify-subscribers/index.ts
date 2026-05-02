import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  kind: "news" | "resource" | "marketing";
  title: string;
  excerpt?: string;
  url?: string;
  hero_image_url?: string;
}

const SITE_URL = "https://shreebalajiagroindustries.lovable.app";
const FROM_NAME = "Shree Balaji Agro Industries";

const buildHtml = (p: Payload, unsubscribeUrl: string) => {
  const heading =
    p.kind === "news"
      ? "📰 New from Shree Balaji Agro"
      : p.kind === "resource"
      ? "🌱 New resource published"
      : "📣 New marketing update";
  const cta = p.url ?? SITE_URL;
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f7f4;margin:0;padding:24px;color:#1f2a1f">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e6e8e3">
      ${p.hero_image_url ? `<img src="${p.hero_image_url}" alt="" style="width:100%;display:block" />` : ""}
      <div style="padding:24px">
        <p style="margin:0 0 8px;color:#3a6b3a;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">${heading}</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#1f2a1f">${escapeHtml(p.title)}</h1>
        ${p.excerpt ? `<p style="margin:0 0 20px;color:#46524a;font-size:15px;line-height:1.55">${escapeHtml(p.excerpt)}</p>` : ""}
        <a href="${cta}" style="display:inline-block;background:#3a6b3a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">Read more</a>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eceee8;background:#fafbf8;font-size:11px;color:#7a857a;text-align:center">
        You're receiving this because you subscribed to updates from ${FROM_NAME}.<br/>
        <a href="${unsubscribeUrl}" style="color:#7a857a">Unsubscribe</a>
      </div>
    </div>
  </body></html>`;
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body?.kind || !body?.title) {
      return new Response(JSON.stringify({ error: "kind and title required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs, error } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);
    if (error) throw error;

    const recipients = (subs ?? []).map((s: any) => s.email).filter(Boolean);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0, note: "no active subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject =
      body.kind === "news"
        ? `📰 ${body.title}`
        : body.kind === "resource"
        ? `🌱 ${body.title}`
        : `📣 ${body.title}`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const email of recipients) {
      const unsub = `${SITE_URL}/?unsubscribe=${encodeURIComponent(email)}`;
      const html = buildHtml(body, unsub);
      try {
        const res = await supabase.functions.invoke("send-transactional-email", {
          body: {
            to: email,
            subject,
            html,
            from_name: FROM_NAME,
          },
        });
        if (res.error) {
          failed++;
          if (errors.length < 3) errors.push(`${email}: ${res.error.message ?? res.error}`);
        } else {
          sent++;
        }
      } catch (e) {
        failed++;
        if (errors.length < 3) errors.push(`${email}: ${(e as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, total: recipients.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});