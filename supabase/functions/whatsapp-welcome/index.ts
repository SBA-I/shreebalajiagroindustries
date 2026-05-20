import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const SITE_URL = "https://shreebalajiagroindustries.lovable.app";

// Configure via secrets once Twilio is connected:
//  - TWILIO_WHATSAPP_FROM: e.g. "whatsapp:+14155238886" (sandbox) or your approved sender
//  - (optional) TWILIO_WHATSAPP_TEMPLATE_SID for HSM template messages

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, email } = await req.json();
    if (!phone || typeof phone !== "string" || !/^\+\d{8,15}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "valid E.164 phone required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !FROM) {
      // Soft-success so subscription UX is not blocked before Twilio is connected.
      return new Response(
        JSON.stringify({ sent: false, note: "Twilio WhatsApp not configured yet" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body =
      `🌱 Welcome to Shree Balaji Agro Industries!\n\n` +
      `Thanks for subscribing${email ? ` (${email})` : ""}. ` +
      `You'll get crop advisories, product launches, and offers on WhatsApp.\n\n` +
      `Explore: ${SITE_URL}\n\n` +
      `Reply STOP to unsubscribe.`;

    const params = new URLSearchParams({
      To: `whatsapp:${phone}`,
      From: FROM.startsWith("whatsapp:") ? FROM : `whatsapp:${FROM}`,
      Body: body,
    });

    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Twilio error", res.status, data);
      return new Response(JSON.stringify({ sent: false, error: data }), {
        status: 200, // don't fail subscriber UX
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ sent: true, sid: data.sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});