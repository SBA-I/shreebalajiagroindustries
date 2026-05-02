import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  date: string;
  heroImageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
}

const mapRow = (r: any): NewsItem => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? "",
  content: Array.isArray(r.content) ? r.content : [],
  category: r.category ?? "company",
  author: r.author ?? "Editorial Team",
  date: r.display_date ?? (r.published_at ? String(r.published_at).slice(0, 10) : ""),
  heroImageUrl: r.hero_image_url ?? null,
  isPublished: !!r.is_published,
  sortOrder: r.sort_order ?? 0,
});

export const useNews = () =>
  useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });

export const useNewsBySlug = (slug: string) =>
  useQuery<NewsItem | null>({
    queryKey: ["news-item", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
    },
    enabled: !!slug,
  });