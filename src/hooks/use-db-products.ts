import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProduct, type Product } from "@/types/product";

export const useProducts = () =>
  useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []).map(mapDbProduct);
    },
  });

export const useProductBySlug = (slug: string) =>
  useQuery<Product | null>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!slug,
  });

export const useProductById = (id: string) =>
  useQuery<Product | null>({
    queryKey: ["product-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!id,
  });
