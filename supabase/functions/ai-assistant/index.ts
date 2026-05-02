import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

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
    const { messages, language } = await req.json();
    // SECURITY: Never trust client-supplied role. This function is public (verify_jwt=false),
    // so we always treat the caller as an unauthenticated visitor. Privileged role-specific
    // contexts must be derived server-side from a verified JWT, not from request body.
    const userRole = "visitor";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch product catalog for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from("products")
      .select("name, category, technical_name, formulation, dosage, target_crops, target_pests, features, safety_precautions, pack_sizes, short_description, mode_of_action")
      .eq("is_active", true);

    const productCatalog = (products || [])
      .map(
        (p) =>
          `• ${p.name} (${p.category}) - ${p.technical_name || ""} ${p.formulation || ""}
  Dosage: ${p.dosage || "N/A"}
  Target Crops: ${(p.target_crops || []).join(", ")}
  Target Pests: ${(p.target_pests || []).join(", ")}
  Mode of Action: ${p.mode_of_action || "N/A"}
  Pack Sizes: ${(p.pack_sizes || []).join(", ")}
  Features: ${(p.features || []).join(", ")}
  Safety: ${(p.safety_precautions || []).join(", ")}
  Description: ${p.short_description || ""}`
      )
      .join("\n\n");

    const langInstruction =
      language === "hi"
        ? "Respond in Hindi (Devanagari script). If the user writes in Hindi, reply in Hindi."
        : language === "mr"
        ? "Respond in Marathi (Devanagari script). If the user writes in Marathi, reply in Marathi."
        : "Respond in English. If the user writes in Hindi or Marathi, still try to understand and respond in the language they used.";

    const roleContext =
      userRole === "dealer" || userRole === "distributor"
        ? `The user is a dealer/distributor. Help with: product availability, pricing queries, bulk order process, delivery info, and technical product details. Be business-focused.`
        : userRole === "farmer"
        ? `The user is a farmer. Help with: crop problems, pest identification, pesticide recommendations, dosage instructions, safety precautions, spray timing, and general farming advice. Be simple and practical.`
        : `The user is a website visitor. Help with: product information, company details, and general agro-chemical queries. Guide them to register as a farmer or dealer if relevant.`;

    const systemPrompt = `You are "Balaji AI 🌱", the AI assistant for Shree Balaji Agro Industries — a leading agrochemical company manufacturing Insecticides, Fungicides, Herbicides, and Plant Growth Regulators (PGR).

${langInstruction}

${roleContext}

## Product Catalog (use ONLY these products for recommendations):
${productCatalog}

## Key Rules:
1. ONLY recommend products from the catalog above. Never invent products.
2. Always include dosage, target crops, and safety precautions when recommending a product.
3. For pest/disease identification, describe symptoms clearly and match to relevant products.
4. For spray dosage calculations: calculate based on field size (1 acre ≈ 200 liters of water for most crops).
5. Always remind farmers about safety: wear protective gear, follow dosage, don't spray against wind.
6. Be concise but thorough. Use bullet points for clarity.
7. If unsure, say so honestly and suggest contacting the company: +91-XXXXXXXXXX or visiting the website.
8. For dealer queries about pricing, say "Please contact our sales team for current pricing and bulk discounts."
9. Format responses with markdown for readability.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI is busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
