import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResourceArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  content: string[];
  category: string;
  type: "article" | "video" | "guide";
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  heroImageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
}

const mapRow = (r: any): ResourceArticle => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? "",
  body: r.body ?? "",
  content: Array.isArray(r.content) && r.content.length > 0
    ? r.content
    : (r.body ? String(r.body).split(/\n\n+/) : []),
  category: r.category ?? "sustainability",
  type: (r.type as "article" | "video" | "guide") ?? "article",
  author: r.author ?? "Editorial Team",
  authorRole: r.author_role ?? "",
  date: r.display_date ?? (r.published_at ? String(r.published_at).slice(0, 10) : ""),
  readTime: r.read_time ?? "5 min read",
  tags: r.tags ?? [],
  featured: !!r.featured,
  heroImageUrl: r.hero_image_url ?? null,
  isPublished: !!r.is_published,
  sortOrder: r.sort_order ?? 0,
});

export const useResources = () =>
  useQuery<ResourceArticle[]>({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sustainability_articles")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

export const useResourceBySlug = (slug: string) =>
  useQuery<ResourceArticle | null>({
    queryKey: ["resource", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sustainability_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
    },
    enabled: !!slug,
  });