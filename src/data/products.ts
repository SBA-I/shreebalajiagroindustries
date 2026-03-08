import productInsecticide from "@/assets/product-insecticide.png";
import productFungicide from "@/assets/product-fungicide.png";
import productHerbicide from "@/assets/product-herbicide.png";
import productPgr from "@/assets/product-pgr.png";

export type ProductCategory = "insecticides" | "fungicides" | "herbicides" | "pgr";

export interface Product {
  id: string;
  name: string;
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
  modeOfAction: string;
  safetyPrecautions: string[];
  features: string[];
  popularity: number;
  isNew: boolean;
}

export const categoryLabels: Record<ProductCategory, string> = {
  insecticides: "Insecticides",
  fungicides: "Fungicides",
  herbicides: "Herbicides",
  pgr: "Plant Growth Regulators",
};

export const categoryImages: Record<ProductCategory, string> = {
  insecticides: productInsecticide,
  fungicides: productFungicide,
  herbicides: productHerbicide,
  pgr: productPgr,
};

export const products: Product[] = [
  {
    id: "sb-ins-001",
    name: "CropShield Super",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Broad-spectrum insect control for all major crops",
    description: "CropShield Super is an advanced systemic insecticide offering excellent control against sucking and chewing pests. Its dual-action formula provides both contact and stomach poison activity, ensuring rapid knockdown and long-lasting protection for up to 21 days.",
    composition: "Imidacloprid 17.8% SL",
    dosage: "0.5–1.0 ml per litre of water",
    targetPests: ["Aphids", "Jassids", "Whitefly", "Thrips", "Brown Plant Hopper"],
    targetCrops: ["Cotton", "Rice", "Wheat", "Vegetables", "Sugarcane"],
    formulation: "Soluble Liquid (SL)",
    packSizes: ["100 ml", "250 ml", "500 ml", "1 L"],
    modeOfAction: "Systemic with contact and stomach action. Disrupts nerve impulse transmission in insects.",
    safetyPrecautions: ["Wear protective gloves and mask during application", "Do not spray against the wind", "Keep away from water bodies and fish ponds", "Observe 14-day pre-harvest interval", "Store in cool, dry place away from children"],
    features: ["Long-lasting residual activity", "Rain-fast within 2 hours", "Low toxicity to mammals", "Compatible with most pesticides"],
    popularity: 95,
    isNew: false,
  },
  {
    id: "sb-ins-002",
    name: "TermiKill Pro",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Premium termite and soil pest control",
    description: "TermiKill Pro offers superior soil pest management with its advanced chlorpyrifos-based formulation. Ideal for pre- and post-construction anti-termite treatment, as well as soil-dwelling pest control in sugarcane and other field crops.",
    composition: "Chlorpyrifos 20% EC",
    dosage: "2.0–4.0 ml per litre of water",
    targetPests: ["Termites", "White Grubs", "Root Grubs", "Cut Worms"],
    targetCrops: ["Sugarcane", "Groundnut", "Potato", "Buildings"],
    formulation: "Emulsifiable Concentrate (EC)",
    packSizes: ["500 ml", "1 L", "5 L"],
    modeOfAction: "Contact, stomach and respiratory action. Inhibits acetylcholinesterase enzyme.",
    safetyPrecautions: ["Use full protective equipment during application", "Avoid skin contact", "Toxic to fish – keep away from aquatic environments", "Observe 30-day pre-harvest interval"],
    features: ["Effective soil barrier protection", "Long residual action in soil", "Broad-spectrum pest control", "Economical and reliable"],
    popularity: 88,
    isNew: false,
  },
  {
    id: "sb-ins-003",
    name: "BioGuard Plus",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Eco-friendly bio-insecticide for sustainable farming",
    description: "BioGuard Plus is a biological insecticide based on Beauveria bassiana, ideal for integrated pest management programs. It targets a wide range of soft-bodied insects while being safe for beneficial organisms and the environment.",
    composition: "Beauveria bassiana 1.15% WP (1 × 10⁸ CFU/g)",
    dosage: "2.5 g per litre of water",
    targetPests: ["Whitefly", "Aphids", "Mealybugs", "Leaf Miner", "Caterpillars"],
    targetCrops: ["Vegetables", "Fruits", "Flowers", "Organic farms"],
    formulation: "Wettable Powder (WP)",
    packSizes: ["100 g", "250 g", "500 g", "1 kg"],
    modeOfAction: "Biological – fungal spores infect and kill target insects over 5-7 days.",
    safetyPrecautions: ["Store in cool, dark place", "Use within 6 months of manufacture", "Do not mix with chemical fungicides", "Safe for pollinators when applied in evening"],
    features: ["Organic farming approved", "Zero pre-harvest interval", "Safe for beneficial insects", "No resistance development"],
    popularity: 78,
    isNew: true,
  },
  {
    id: "sb-fun-001",
    name: "FungiCure Max",
    category: "fungicides",
    categoryLabel: "Fungicides",
    image: productFungicide,
    tagline: "Advanced systemic fungicide for complete disease control",
    description: "FungiCure Max is a combination fungicide offering preventive, curative, and eradicant action against a wide range of foliar and soil-borne fungal diseases. Its dual active ingredients provide multi-site activity to prevent resistance development.",
    composition: "Carbendazim 12% + Mancozeb 63% WP",
    dosage: "2.0–2.5 g per litre of water",
    targetPests: ["Blast", "Sheath Blight", "Downy Mildew", "Late Blight", "Powdery Mildew", "Rust"],
    targetCrops: ["Rice", "Wheat", "Potato", "Grapes", "Tomato", "Chilli"],
    formulation: "Wettable Powder (WP)",
    packSizes: ["100 g", "250 g", "500 g", "1 kg"],
    modeOfAction: "Systemic and contact. Inhibits cell division and multi-site enzyme disruption.",
    safetyPrecautions: ["Avoid inhalation of spray mist", "Wash hands thoroughly after use", "Do not contaminate food or feed", "Observe 15-day pre-harvest interval"],
    features: ["Dual mode of action prevents resistance", "Excellent rain-fastness", "Compatible with most insecticides", "Cost-effective disease management"],
    popularity: 92,
    isNew: false,
  },
  {
    id: "sb-fun-002",
    name: "CopperShield 50",
    category: "fungicides",
    categoryLabel: "Fungicides",
    image: productFungicide,
    tagline: "Copper-based protectant fungicide",
    description: "CopperShield 50 is a reliable copper oxychloride-based fungicide that provides excellent protective action against bacterial and fungal diseases. Ideal for regular spray schedules in fruit orchards and vegetable crops.",
    composition: "Copper Oxychloride 50% WP",
    dosage: "2.5–3.0 g per litre of water",
    targetPests: ["Bacterial Leaf Blight", "Downy Mildew", "Canker", "Leaf Spot"],
    targetCrops: ["Citrus", "Grapes", "Potato", "Tomato", "Pomegranate"],
    formulation: "Wettable Powder (WP)",
    packSizes: ["250 g", "500 g", "1 kg"],
    modeOfAction: "Contact and preventive. Copper ions disrupt fungal enzyme systems.",
    safetyPrecautions: ["Do not apply in hot sunny conditions", "Avoid copper-sensitive crop varieties", "Keep away from eyes", "Observe 7-day pre-harvest interval"],
    features: ["Broad-spectrum protection", "Bactericidal action", "Excellent sticking properties", "Economical for regular sprays"],
    popularity: 75,
    isNew: false,
  },
  {
    id: "sb-fun-003",
    name: "TriazolGuard",
    category: "fungicides",
    categoryLabel: "Fungicides",
    image: productFungicide,
    tagline: "Next-gen triazole fungicide for premium crops",
    description: "TriazolGuard delivers powerful curative and protective action against rust, powdery mildew, and other foliar diseases. Its advanced triazole chemistry ensures rapid uptake and long-lasting systemic protection.",
    composition: "Propiconazole 25% EC",
    dosage: "1.0 ml per litre of water",
    targetPests: ["Rust", "Powdery Mildew", "Sheath Blight", "Tikka Leaf Spot"],
    targetCrops: ["Wheat", "Rice", "Groundnut", "Soybean", "Tea"],
    formulation: "Emulsifiable Concentrate (EC)",
    packSizes: ["100 ml", "250 ml", "500 ml", "1 L"],
    modeOfAction: "Systemic. Inhibits ergosterol biosynthesis in fungal cell membranes.",
    safetyPrecautions: ["Wear protective clothing", "Do not mix with alkaline pesticides", "Toxic to aquatic organisms", "Observe 21-day pre-harvest interval"],
    features: ["Rapid curative action", "Excellent systemic movement", "Growth stimulant effect on crops", "Long protection period"],
    popularity: 85,
    isNew: true,
  },
  {
    id: "sb-her-001",
    name: "WeedClear 41",
    category: "herbicides",
    categoryLabel: "Herbicides",
    image: productHerbicide,
    tagline: "Non-selective herbicide for total weed management",
    description: "WeedClear 41 is a broad-spectrum, non-selective herbicide for effective control of annual and perennial weeds, grasses, and woody plants. Ideal for pre-planting land preparation and non-crop areas.",
    composition: "Glyphosate 41% SL",
    dosage: "6–10 ml per litre of water",
    targetPests: ["Annual Grasses", "Perennial Weeds", "Sedges", "Woody Plants"],
    targetCrops: ["Pre-planting", "Orchards", "Tea Plantations", "Non-crop areas"],
    formulation: "Soluble Liquid (SL)",
    packSizes: ["250 ml", "500 ml", "1 L", "5 L"],
    modeOfAction: "Systemic. Inhibits EPSPS enzyme in the shikimate pathway.",
    safetyPrecautions: ["Do not spray on green crop foliage", "Avoid drift to adjacent crops", "Toxic to aquatic life", "Allow 7 days before sowing"],
    features: ["No soil residual activity", "Translocates to roots for complete kill", "Effective on 100+ weed species", "Economical weed management"],
    popularity: 90,
    isNew: false,
  },
  {
    id: "sb-her-002",
    name: "SelectiWeed Pro",
    category: "herbicides",
    categoryLabel: "Herbicides",
    image: productHerbicide,
    tagline: "Selective post-emergence herbicide for cereal crops",
    description: "SelectiWeed Pro is a selective herbicide specifically designed for broad-leaved weed control in wheat, barley, and other cereal crops. Applied post-emergence, it targets weeds without harming the main crop.",
    composition: "2,4-D Amine Salt 58% SL",
    dosage: "1.5–2.5 ml per litre of water",
    targetPests: ["Bathua", "Hirankhuri", "Krishnaneel", "Wild Mustard", "Broad-leaved weeds"],
    targetCrops: ["Wheat", "Rice", "Sugarcane", "Maize", "Sorghum"],
    formulation: "Soluble Liquid (SL)",
    packSizes: ["250 ml", "500 ml", "1 L"],
    modeOfAction: "Systemic. Synthetic auxin causing uncontrolled cell growth in broad-leaved weeds.",
    safetyPrecautions: ["Apply at recommended crop stage only", "Do not spray near dicot crops", "Avoid spray drift", "Observe 30-day pre-harvest interval"],
    features: ["Selective – safe for cereals", "Rapid visual weed kill", "Cost-effective broadleaf control", "Easy to apply"],
    popularity: 82,
    isNew: false,
  },
  {
    id: "sb-her-003",
    name: "PreEmerge Shield",
    category: "herbicides",
    categoryLabel: "Herbicides",
    image: productHerbicide,
    tagline: "Pre-emergence herbicide for season-long weed control",
    description: "PreEmerge Shield creates a herbicide barrier in the soil surface that prevents weed seed germination for up to 45 days. Ideal for soybean, groundnut, and vegetable crops where early weed competition can reduce yields significantly.",
    composition: "Pendimethalin 30% EC",
    dosage: "3.0–5.0 ml per litre of water",
    targetPests: ["Annual Grasses", "Small-seeded Broadleaf Weeds", "Crabgrass", "Goosegrass"],
    targetCrops: ["Soybean", "Groundnut", "Onion", "Garlic", "Vegetables"],
    formulation: "Emulsifiable Concentrate (EC)",
    packSizes: ["250 ml", "500 ml", "1 L", "5 L"],
    modeOfAction: "Pre-emergence. Inhibits cell division in emerging weed seedlings.",
    safetyPrecautions: ["Apply on moist soil for best results", "Do not disturb soil after application", "Avoid contact with skin", "Not for sandy soils"],
    features: ["Up to 45 days weed-free period", "Safe for listed crops at recommended dose", "Excellent soil binding", "Rain-fast once dry"],
    popularity: 76,
    isNew: false,
  },
  {
    id: "sb-pgr-001",
    name: "GrowMax Elite",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Boost flowering and fruit setting naturally",
    description: "GrowMax Elite is a plant growth regulator that enhances flowering, fruit setting, and overall plant vigor. It optimizes the hormonal balance in plants, leading to improved photosynthesis, nutrient uptake, and higher yields.",
    composition: "Gibberellic Acid 0.001% L",
    dosage: "1.0–2.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["Grapes", "Cotton", "Rice", "Vegetables", "Fruits"],
    formulation: "Liquid (L)",
    packSizes: ["50 ml", "100 ml", "250 ml", "1 L"],
    modeOfAction: "Hormonal regulation. Promotes cell elongation, flowering, and fruit development.",
    safetyPrecautions: ["Apply at recommended growth stage", "Do not exceed recommended dose", "Store in cool dark place", "Shake well before use"],
    features: ["Increases fruit size and weight", "Promotes uniform ripening", "Enhances seed germination", "Breaks seed dormancy"],
    popularity: 87,
    isNew: false,
  },
  {
    id: "sb-pgr-002",
    name: "RootBoost 500",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Powerful root development promoter",
    description: "RootBoost 500 is a specialized plant growth regulator that stimulates robust root development, leading to better nutrient and water absorption. Ideal for transplanting, nursery applications, and stress recovery in crops.",
    composition: "Humic Acid 12% + Seaweed Extract 8%",
    dosage: "2.0–3.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["All Crops", "Nursery Plants", "Transplanted Vegetables", "Fruit Trees"],
    formulation: "Liquid (L)",
    packSizes: ["100 ml", "250 ml", "500 ml", "1 L"],
    modeOfAction: "Bio-stimulant. Enhances root growth through auxin-like activity and soil microbiome improvement.",
    safetyPrecautions: ["Safe for organic farming", "Can be used via drip irrigation", "Store away from direct sunlight", "Use within 24 months"],
    features: ["Rapid root establishment", "Improves soil health", "Enhances stress tolerance", "Compatible with fertilizers"],
    popularity: 80,
    isNew: true,
  },
  {
    id: "sb-pgr-003",
    name: "YieldPlus Pro",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Complete plant nutrition and growth enhancer",
    description: "YieldPlus Pro is a multi-action plant growth enhancer combining micro-nutrients, amino acids, and natural growth promoters. It addresses hidden hunger in crops and unlocks yield potential through improved metabolism.",
    composition: "Amino Acids 15% + Micronutrients (Zn, Fe, Mn, B)",
    dosage: "2.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["Cotton", "Soybean", "Chilli", "Paddy", "Wheat", "All Crops"],
    formulation: "Liquid (L)",
    packSizes: ["100 ml", "250 ml", "500 ml", "1 L"],
    modeOfAction: "Nutritional supplement. Provides chelated micronutrients and amino acid building blocks for protein synthesis.",
    safetyPrecautions: ["Apply in morning or evening hours", "Avoid mixing with alkaline pesticides", "Perform compatibility test first", "Safe for environment"],
    features: ["Corrects micronutrient deficiency", "Improves crop quality", "Enhances natural resistance", "Fast foliar absorption"],
    popularity: 83,
    isNew: false,
  },
];

export const getProductById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getRelatedProducts = (product: Product, count = 4): Product[] =>
  products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, count)
    .concat(
      products
        .filter((p) => p.id !== product.id && p.category !== product.category)
        .slice(0, count)
    )
    .slice(0, count);
