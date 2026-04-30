import { Database } from "@/integrations/supabase/types";

// DB row type
export type DbProduct = Database["public"]["Tables"]["products"]["Row"];

// Category mappings
export type ProductCategory = "insecticides" | "fungicides" | "herbicides" | "pgr";

export const dbCategoryToLocal: Record<string, ProductCategory> = {
  Insecticides: "insecticides",
  Fungicides: "fungicides",
  Herbicides: "herbicides",
  PGR: "pgr",
};

export const categoryLabels: Record<ProductCategory, string> = {
  insecticides: "Insecticides",
  fungicides: "Fungicides",
  herbicides: "Herbicides",
  pgr: "Plant Growth Regulators",
};

// Unified product type used by all frontend components
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categoryLabel: string;
  image: string;
  tagline: string;
  description: string;
  composition: string;
  dosage: string;
  targetPests: string[];
  targetCrops: string[];
  formulation: string;
  packSizes: string[];
  pricing: { size: string; mrp: string }[];
  modeOfAction: string;
  safetyPrecautions: string[];
  features: string[];
  popularity: number;
  isNew: boolean;
  price: number | null;
}

// Default category images
import productInsecticide from "@/assets/product-insecticide.png";
import productFungicide from "@/assets/product-fungicide.png";
import productHerbicide from "@/assets/product-herbicide.png";
import productPgr from "@/assets/product-pgr.png";

const categoryImages: Record<ProductCategory, string> = {
  insecticides: productInsecticide,
  fungicides: productFungicide,
  herbicides: productHerbicide,
  pgr: productPgr,
};

/** Convert a DB product row into the frontend Product type */
export function mapDbProduct(p: DbProduct): Product {
  const localCat = dbCategoryToLocal[p.category] ?? "insecticides";
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: localCat,
    categoryLabel: categoryLabels[localCat],
    image: p.image_url || categoryImages[localCat],
    tagline: p.short_description ?? "",
    description: p.description ?? "",
    composition: p.technical_name ?? "",
    dosage: p.dosage ?? "",
    targetPests: p.target_pests ?? [],
    targetCrops: p.target_crops ?? [],
    formulation: p.formulation ?? "",
    packSizes: (p as any).pack_sizes ?? [],
    pricing: (p as any).pricing ?? [],
    modeOfAction: (p as any).mode_of_action ?? "",
    safetyPrecautions: (p as any).safety_precautions ?? [],
    features: p.features ?? [],
    popularity: (p as any).popularity ?? 50,
    isNew: (p as any).is_new ?? false,
    price: p.price ? Number(p.price) : null,
  };
}

export function getRelatedProducts(product: Product, allProducts: Product[], count = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, count)
    .concat(
      allProducts.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, count)
    )
    .slice(0, count);
}
