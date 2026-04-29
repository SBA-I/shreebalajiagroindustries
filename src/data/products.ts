import productInsecticide from "@/assets/product-insecticide.png";
import productFungicide from "@/assets/product-fungicide.png";
import productHerbicide from "@/assets/product-herbicide.png";
import productPgr from "@/assets/product-pgr.png";

export type ProductCategory = "insecticides" | "fungicides" | "herbicides" | "pgr";

export interface PackPrice {
  size: string;
  dealerPrice: string;
  mrp: string;
}

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
  pricing: PackPrice[];
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

const sizesFrom = (pricing: PackPrice[]) => pricing.map((p) => p.size);

export const products: Product[] = [
  {
    id: "sb-001",
    name: "Jaguar / Phantom / Terminater",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Bio fungi, larvicide & sucking pest control with growth promotion",
    description:
      "A multi-action bio formulation effective against fungal infections, larvae, sucking pests, thrips and flies, while also working as a growth promoter. Built on natural oils for safe, residue-free protection across cotton, vegetables and horticulture crops.",
    composition: "Bio fungi + Larvicide + Natural oil blend (Growth Promoter)",
    dosage: "1.5–2.0 ml per litre of water",
    targetPests: ["Fungal infections", "Larvae", "Sucking pests", "Thrips", "Whitefly"],
    targetCrops: ["Cotton", "Chilli", "Vegetables", "Soybean", "Fruit crops"],
    formulation: "Liquid (Natural Oil based)",
    packSizes: ["30 ml", "50 ml", "100 ml", "250 ml", "500 ml", "1 Ltr"],
    pricing: [
      { size: "1 Ltr", dealerPrice: "₹3,010", mrp: "₹3,490" },
      { size: "500 ml", dealerPrice: "₹1,510", mrp: "₹1,750" },
      { size: "250 ml", dealerPrice: "₹760", mrp: "₹880" },
      { size: "100 ml", dealerPrice: "₹310", mrp: "₹360" },
      { size: "50 ml", dealerPrice: "₹160", mrp: "₹190" },
      { size: "30 ml", dealerPrice: "₹120", mrp: "₹150" },
    ],
    modeOfAction:
      "Multi-site bio action — natural oils suffocate sucking pests and larvae while plant-defence elicitors trigger systemic resistance against fungal pathogens.",
    safetyPrecautions: [
      "Shake well before use",
      "Spray during cool hours of the day",
      "Avoid mixing with strongly alkaline products",
      "Keep away from children and food",
    ],
    features: [
      "3-in-1 action: insect + fungal + growth",
      "Residue-free, export-friendly",
      "Safe for pollinators when sprayed in evening",
      "Improves crop vigour and shine",
    ],
    popularity: 96,
    isNew: false,
  },
  {
    id: "sb-002",
    name: "Sumo Fighter / Altra Clean",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Bio control for sucking pests, thrips, flies & larvae",
    description:
      "A natural-oil based bio insecticide that delivers strong knockdown of sucking pests, thrips, whiteflies and larval stages. Cleans up infestations without harming beneficial insects, ideal for IPM programs in cotton, chilli and vegetables.",
    composition: "Natural oil based bio insecticide (Sucking pest + Larvicide)",
    dosage: "1.5–2.0 ml per litre of water",
    targetPests: ["Sucking pests", "Thrips", "Whitefly", "Larvae", "Mites"],
    targetCrops: ["Cotton", "Chilli", "Brinjal", "Tomato", "Okra", "Grapes"],
    formulation: "Liquid (Natural Oil based)",
    packSizes: ["30 ml", "50 ml", "100 ml", "250 ml", "500 ml", "1 Ltr"],
    pricing: [
      { size: "1 Ltr", dealerPrice: "₹2,450", mrp: "₹3,090" },
      { size: "500 ml", dealerPrice: "₹1,230", mrp: "₹1,560" },
      { size: "250 ml", dealerPrice: "₹620", mrp: "₹790" },
      { size: "100 ml", dealerPrice: "₹260", mrp: "₹330" },
      { size: "50 ml", dealerPrice: "₹135", mrp: "₹170" },
      { size: "30 ml", dealerPrice: "₹100", mrp: "₹120" },
    ],
    modeOfAction:
      "Contact action — coats and suffocates sucking pests and larvae; disrupts insect respiration without chemical residues.",
    safetyPrecautions: [
      "Use protective gloves while spraying",
      "Avoid spraying in peak sun",
      "Compatible with most bio products",
      "Store in a cool, dry place",
    ],
    features: [
      "Quick knockdown of sucking complex",
      "Safe for natural enemies",
      "Zero pre-harvest interval",
      "Residue-free harvest",
    ],
    popularity: 92,
    isNew: false,
  },
  {
    id: "sb-003",
    name: "Killer",
    category: "insecticides",
    categoryLabel: "Insecticides",
    image: productInsecticide,
    tagline: "Bio larvicide powered by natural oils",
    description:
      "Killer is a focused bio larvicide built on a blend of natural oils, designed to eliminate caterpillars and larval pests at all stages. Excellent companion product in spray schedules where larval pressure is high.",
    composition: "Natural Oils (Bio Larvicide)",
    dosage: "1.5–2.0 ml per litre of water",
    targetPests: ["Caterpillars", "Bollworm larvae", "Leaf eating larvae", "Stem borer"],
    targetCrops: ["Cotton", "Soybean", "Pulses", "Vegetables"],
    formulation: "Liquid (Natural Oil based)",
    packSizes: ["50 ml", "100 ml", "250 ml", "500 ml", "1 Ltr"],
    pricing: [
      { size: "1 Ltr", dealerPrice: "₹2,520", mrp: "₹3,100" },
      { size: "500 ml", dealerPrice: "₹1,265", mrp: "₹1,555" },
      { size: "250 ml", dealerPrice: "₹640", mrp: "₹775" },
      { size: "100 ml", dealerPrice: "₹260", mrp: "₹320" },
      { size: "50 ml", dealerPrice: "₹135", mrp: "₹160" },
    ],
    modeOfAction:
      "Smothering and anti-feeding action on larvae; disrupts moulting and gut function in soft-bodied stages.",
    safetyPrecautions: [
      "Spray uniformly on undersides of leaves",
      "Do not mix with alkaline solutions",
      "Wash hands after handling",
    ],
    features: [
      "Targeted larvae control",
      "Safe with bio insecticides",
      "Improves leaf surface health",
      "No chemical residue",
    ],
    popularity: 88,
    isNew: false,
  },
  {
    id: "sb-004",
    name: "Jaadu",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "High-concentration bio stimulant for visible results",
    description:
      "Jaadu is a high-concentration bio stimulant that activates plant metabolism, boosts greening and recovers crops from stress within days. A small dose delivers a strong growth response — ideal as a quick rescue and yield-builder spray.",
    composition: "High Concentration Bio Stimulant (plant extracts + organic acids)",
    dosage: "0.5–1.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["All crops", "Cotton", "Chilli", "Grapes", "Vegetables", "Pulses"],
    formulation: "Liquid Bio Stimulant",
    packSizes: ["10 ml", "25 ml", "50 ml", "100 ml"],
    pricing: [
      { size: "100 ml", dealerPrice: "₹660", mrp: "₹990" },
      { size: "50 ml", dealerPrice: "₹340", mrp: "₹512" },
      { size: "25 ml", dealerPrice: "₹170", mrp: "₹270" },
      { size: "10 ml", dealerPrice: "₹70", mrp: "₹115" },
    ],
    modeOfAction:
      "Activates enzymatic and hormonal pathways — promotes chlorophyll synthesis, root activity and stress recovery.",
    safetyPrecautions: [
      "Do not exceed recommended dose",
      "Use within recommended growth stage",
      "Store in a cool, dark place",
    ],
    features: [
      "Visible greening within 3–5 days",
      "Quick recovery from stress",
      "Boosts flowering and pod-set",
      "Compatible with most foliar sprays",
    ],
    popularity: 94,
    isNew: true,
  },
  {
    id: "sb-005",
    name: "Double Flower",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Bio stimulant for heavy flowering and fruit setting",
    description:
      "Double Flower is a flowering-focused bio stimulant that pushes plants to produce more flowers and convert them into healthy fruits. Reduces flower drop and improves uniformity of setting in cotton, chilli, pulses and vegetables.",
    composition: "Bio Stimulant (Flowering & fruit-set blend)",
    dosage: "1.5–2.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["Cotton", "Chilli", "Tomato", "Pulses", "Mango", "Pomegranate"],
    formulation: "Liquid Bio Stimulant",
    packSizes: ["50 ml", "100 ml", "250 ml", "500 ml"],
    pricing: [
      { size: "500 ml", dealerPrice: "₹1,260", mrp: "₹1,510" },
      { size: "250 ml", dealerPrice: "₹635", mrp: "₹760" },
      { size: "100 ml", dealerPrice: "₹260", mrp: "₹310" },
      { size: "50 ml", dealerPrice: "₹130", mrp: "₹160" },
    ],
    modeOfAction:
      "Hormonal balancing for flower induction and retention; reduces flower and fruit drop by improving nutrient mobilisation.",
    safetyPrecautions: [
      "Apply at flower initiation stage",
      "Repeat at 15-day interval",
      "Do not mix with copper-based products",
    ],
    features: [
      "More flowers per plant",
      "Reduced flower drop",
      "Better fruit setting",
      "Higher marketable yield",
    ],
    popularity: 90,
    isNew: false,
  },
  {
    id: "sb-006",
    name: "Roots Kings",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Potassium humate flakes for powerful root systems",
    description:
      "Roots Kings is a high-grade Potassium Humate in flake form that energises soil biology, builds strong root systems and improves nutrient uptake. The foam-grade flakes dissolve quickly for drip or drench application.",
    composition: "Potassium Humate (Flakes / Foam grade)",
    dosage: "1–2 g per litre of water (drip / drench)",
    targetPests: [],
    targetCrops: ["All crops", "Sugarcane", "Banana", "Vegetables", "Cotton", "Fruits"],
    formulation: "Soluble Flakes",
    packSizes: ["50 gm", "100 gm", "250 gm", "500 gm", "1 Kg"],
    pricing: [
      { size: "1 Kg", dealerPrice: "₹660", mrp: "₹1,150" },
      { size: "500 gm", dealerPrice: "₹335", mrp: "₹650" },
      { size: "250 gm", dealerPrice: "₹175", mrp: "₹380" },
      { size: "100 gm", dealerPrice: "₹75", mrp: "₹150" },
      { size: "50 gm", dealerPrice: "₹40", mrp: "₹80" },
    ],
    modeOfAction:
      "Improves soil structure and CEC, stimulates root branching, unlocks fixed nutrients and feeds soil microbes.",
    safetyPrecautions: [
      "Dissolve fully before drip application",
      "Do not mix with calcium-based products",
      "Store away from moisture",
    ],
    features: [
      "Fast root development",
      "Better nutrient absorption",
      "Improves soil health",
      "Drip & drench compatible",
    ],
    popularity: 91,
    isNew: false,
  },
  {
    id: "sb-007",
    name: "Liaf Stick",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Silicon sticker & spreader for superior spray performance",
    description:
      "Liaf Stick is a silicon-based sticker and spreader that ensures uniform coverage of any pesticide, fungicide or fertiliser spray. It improves leaf wetting, prevents wash-off and increases effectiveness of every drop.",
    composition: "Silicon based Sticker / Spreader",
    dosage: "0.3–0.5 ml per litre of spray solution",
    targetPests: [],
    targetCrops: ["All crops"],
    formulation: "Liquid (Silicon Surfactant)",
    packSizes: ["50 ml", "100 ml", "250 ml"],
    pricing: [
      { size: "250 ml", dealerPrice: "₹320", mrp: "₹560" },
      { size: "100 ml", dealerPrice: "₹130", mrp: "₹240" },
      { size: "50 ml", dealerPrice: "₹75", mrp: "₹125" },
    ],
    modeOfAction:
      "Reduces surface tension of spray droplets, spreading them as a uniform film and binding actives to the leaf surface.",
    safetyPrecautions: [
      "Add at the end while preparing spray",
      "Do not over-dose, may cause excessive run-off",
      "Avoid contact with eyes",
    ],
    features: [
      "Better spray spread",
      "Rain-fast bonding",
      "Saves spray quantity",
      "Works with all agro inputs",
    ],
    popularity: 86,
    isNew: false,
  },
  {
    id: "sb-008",
    name: "Amino-Star",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Amino acid tonic for fast crop recovery & growth",
    description:
      "Amino-Star delivers free L-amino acids that plants can absorb and use directly — saving energy and accelerating growth. Ideal after stress conditions, transplant shock or during peak demand stages like flowering and grain filling.",
    composition: "Amino Acids (L-form)",
    dosage: "1.5–2.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["All crops", "Vegetables", "Cotton", "Chilli", "Cereals", "Fruits"],
    formulation: "Liquid Amino Acid",
    packSizes: ["100 ml", "250 ml", "500 ml", "1 Ltr"],
    pricing: [
      { size: "1 Ltr", dealerPrice: "₹550", mrp: "₹830" },
      { size: "500 ml", dealerPrice: "₹280", mrp: "₹420" },
      { size: "250 ml", dealerPrice: "₹145", mrp: "₹215" },
      { size: "100 ml", dealerPrice: "₹60", mrp: "₹90" },
    ],
    modeOfAction:
      "Provides ready-to-use building blocks for protein synthesis, chlorophyll formation and stress hormone production.",
    safetyPrecautions: [
      "Avoid spraying in extreme heat",
      "Compatible with most foliar sprays",
      "Store in a cool place",
    ],
    features: [
      "Quick stress recovery",
      "Stronger vegetative growth",
      "Better grain & fruit quality",
      "Foliar & drip compatible",
    ],
    popularity: 89,
    isNew: false,
  },
  {
    id: "sb-009",
    name: "Bio Ween",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Pure sea weed extract for natural plant power",
    description:
      "Bio Ween is a premium sea weed extract that combines natural plant growth promoters, cytokinins and trace nutrients. It improves overall vigour, flowering, fruit retention and quality across all crops.",
    composition: "Sea Weed Extract (Ascophyllum nodosum based)",
    dosage: "2.0–3.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["All crops", "Grapes", "Pomegranate", "Vegetables", "Cotton", "Cereals"],
    formulation: "Liquid Bio Stimulant",
    packSizes: ["250 ml", "500 ml", "1 Ltr", "5 Ltr"],
    pricing: [
      { size: "5 Ltr", dealerPrice: "₹1,225", mrp: "₹3,210" },
      { size: "1 Ltr", dealerPrice: "₹260", mrp: "₹670" },
      { size: "500 ml", dealerPrice: "₹135", mrp: "₹340" },
      { size: "250 ml", dealerPrice: "₹70", mrp: "₹180" },
    ],
    modeOfAction:
      "Natural cytokinins and auxins stimulate cell division, root and shoot growth, and enhance abiotic stress tolerance.",
    safetyPrecautions: [
      "Shake well before use",
      "Do not store in direct sunlight",
      "Compatible with most agro chemicals",
    ],
    features: [
      "100% natural growth booster",
      "Improves flowering and shine",
      "Increases stress tolerance",
      "Drip & spray compatible",
    ],
    popularity: 93,
    isNew: true,
  },
  {
    id: "sb-010",
    name: "Openar",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Liquid humic acid for soil & root rejuvenation",
    description:
      "Openar is a high-quality liquid humic acid formulation that conditions soil, opens up root zones and improves nutrient mobility. Ideal for drip systems, drenching and combination with fertilisers.",
    composition: "Humic Acid (Liquid)",
    dosage: "2.0–3.0 ml per litre of water",
    targetPests: [],
    targetCrops: ["All crops", "Sugarcane", "Banana", "Vegetables", "Fruits", "Cotton"],
    formulation: "Liquid Humic Acid",
    packSizes: ["250 ml", "500 ml", "1 Ltr", "5 Ltr"],
    pricing: [
      { size: "5 Ltr", dealerPrice: "₹1,225", mrp: "₹3,120" },
      { size: "1 Ltr", dealerPrice: "₹250", mrp: "₹640" },
      { size: "500 ml", dealerPrice: "₹130", mrp: "₹330" },
      { size: "250 ml", dealerPrice: "₹70", mrp: "₹175" },
    ],
    modeOfAction:
      "Chelates micronutrients, improves cation exchange capacity and stimulates root hair development.",
    safetyPrecautions: [
      "Do not mix with strong acids",
      "Use clean water for dilution",
      "Store away from sunlight",
    ],
    features: [
      "Loosens compacted soil",
      "Improves fertiliser efficiency",
      "Supports microbial life",
      "Drip-irrigation friendly",
    ],
    popularity: 87,
    isNew: false,
  },
  {
    id: "sb-011",
    name: "Black Diamond",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Premium humic ball for slow, steady soil enrichment",
    description:
      "Black Diamond is a humic acid ball formulation designed for broadcast and basal application. Slowly releases humic substances into the soil, enriching it season after season and improving root environment.",
    composition: "Humic Boll (Granulated Humic Acid)",
    dosage: "4 Kg per acre (basal application)",
    targetPests: [],
    targetCrops: ["Sugarcane", "Banana", "Cotton", "Vegetables", "Orchards"],
    formulation: "Granular / Ball",
    packSizes: ["4 Kg"],
    pricing: [{ size: "4 Kg", dealerPrice: "₹610", mrp: "₹720" }],
    modeOfAction:
      "Slow-release humic substances rebuild soil organic matter, improve aeration and water-holding capacity.",
    safetyPrecautions: [
      "Apply in moist soil for best results",
      "Mix lightly with topsoil after application",
      "Store in a dry place",
    ],
    features: [
      "Long-lasting soil enrichment",
      "Easy basal application",
      "Builds organic carbon",
      "Excellent value per acre",
    ],
    popularity: 84,
    isNew: false,
  },
  {
    id: "sb-012",
    name: "Zyme-G",
    category: "pgr",
    categoryLabel: "Plant Growth Regulators",
    image: productPgr,
    tagline: "Granular bio enzyme for healthy, productive soils",
    description:
      "Zyme-G is a granular bio-enzyme blend that introduces beneficial microbial activity directly into the root zone. Ideal as a basal application to wake up tired soils and prepare them for high-yield cultivation.",
    composition: "Bio Enzymes (Granules)",
    dosage: "25 Kg per acre (basal)",
    targetPests: [],
    targetCrops: ["All field crops", "Sugarcane", "Cotton", "Vegetables", "Pulses"],
    formulation: "Granules",
    packSizes: ["25 Kg"],
    pricing: [{ size: "25 Kg", dealerPrice: "₹760", mrp: "₹1,160" }],
    modeOfAction:
      "Microbial enzymes solubilise locked nutrients and accelerate decomposition of organic matter in the soil.",
    safetyPrecautions: [
      "Apply on well-prepared soil",
      "Avoid mixing directly with chemical fertilisers",
      "Store in a cool, dry place",
    ],
    features: [
      "Improves soil fertility",
      "Boosts microbial activity",
      "Strong base for any crop",
      "Cost-effective per acre",
    ],
    popularity: 82,
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

// Backwards-compat helper for any code referencing pack sizes only
export const packSizesFor = (p: Product) => sizesFrom(p.pricing);
