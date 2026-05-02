import { supabase } from "@/integrations/supabase/client";

const SITE = "https://shreebalajiagroindustries.lovable.app";

type Kind = "news" | "resource" | "marketing";

export const notifySubscribers = async (
  kind: Kind,
  args: { title: string; excerpt?: string; slug?: string; hero_image_url?: string },
) => {
  const url =
    kind === "news" && args.slug
      ? `${SITE}/news/${args.slug}`
      : kind === "resource" && args.slug
      ? `${SITE}/resources/${args.slug}`
      : `${SITE}/`;
  try {
    const { error } = await supabase.functions.invoke("notify-subscribers", {
      body: {
        kind,
        title: args.title,
        excerpt: args.excerpt,
        url,
        hero_image_url: args.hero_image_url,
      },
    });
    if (error) console.warn("[notify-subscribers] failed:", error.message);
  } catch (e) {
    console.warn("[notify-subscribers] exception:", e);
  }
};