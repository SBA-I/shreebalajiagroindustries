// Local agronomy reference data — Maharashtra (Dhule region)
// No external API tokens required.

export interface PhiInfo {
  productName: string;
  productSlug?: string;
  category: "insecticides" | "fungicides" | "herbicides" | "pgr";
  phiDays: number; // Pre-Harvest Interval
  reEntryHours?: number;
  greenAlternative?: string; // suggested bio/safer alt for late season
}

// PHI lookup keyed by lowercased product name
export const PHI_LIBRARY: PhiInfo[] = [
  { productName: "Jaguar", category: "insecticides", phiDays: 7, reEntryHours: 12, greenAlternative: "Neem-based bio-insecticide" },
  { productName: "Phantom", category: "insecticides", phiDays: 14, reEntryHours: 24, greenAlternative: "Bio-larvicide (Bt)" },
  { productName: "Terminator", category: "insecticides", phiDays: 21, reEntryHours: 24, greenAlternative: "Pheromone trap + Neem oil" },
];

export const DEFAULT_PHI_BY_CATEGORY: Record<string, number> = {
  insecticides: 14,
  fungicides: 10,
  herbicides: 21,
  pgr: 7,
};

// Crop maturity windows in days (sowing to harvest start)
export interface CropMaturity {
  crop: string;
  variety: string;
  minDays: number;
  maxDays: number;
}

export const CROP_MATURITY: CropMaturity[] = [
  { crop: "Cotton", variety: "BT Hybrid (120-day)", minDays: 150, maxDays: 180 },
  { crop: "Cotton", variety: "Desi (90-day)", minDays: 120, maxDays: 150 },
  { crop: "Soybean", variety: "JS-335", minDays: 95, maxDays: 105 },
  { crop: "Soybean", variety: "MACS-1188", minDays: 90, maxDays: 100 },
  { crop: "Onion", variety: "Kharif", minDays: 100, maxDays: 120 },
  { crop: "Onion", variety: "Rabi", minDays: 130, maxDays: 150 },
  { crop: "Wheat", variety: "Lokvan", minDays: 110, maxDays: 125 },
  { crop: "Sugarcane", variety: "Adsali", minDays: 360, maxDays: 420 },
  { crop: "Tomato", variety: "Hybrid", minDays: 70, maxDays: 90 },
  { crop: "Chilli", variety: "Hybrid", minDays: 90, maxDays: 110 },
];

// Pest calendar — crop-stage based + monthly pressure for Maharashtra
export type CropStage = "Seedling" | "Vegetative" | "Flowering" | "Fruiting" | "Maturity";

export interface StagePest {
  pest: string;
  severity: "low" | "medium" | "high";
  treatmentProductSlug?: string;
  treatmentProductName?: string;
  notes?: string;
}

export interface CropProgram {
  crop: string;
  stages: Record<CropStage, StagePest[]>;
  // 12-month pressure index 0-3 (0 none, 3 peak)
  monthlyPressure: number[];
  scoutingChecklist: { month: string; task: string }[];
}

export const CROP_PROGRAMS: CropProgram[] = [
  {
    crop: "Cotton",
    stages: {
      Seedling: [
        { pest: "Aphids", severity: "medium", treatmentProductName: "Jaguar", notes: "Inspect undersides of leaves." },
        { pest: "Thrips", severity: "medium", treatmentProductName: "Jaguar" },
      ],
      Vegetative: [
        { pest: "Jassids", severity: "high", treatmentProductName: "Phantom" },
        { pest: "Whitefly", severity: "medium", treatmentProductName: "Jaguar" },
      ],
      Flowering: [
        { pest: "Thrips", severity: "high", treatmentProductName: "Jaguar" },
        { pest: "Mealybug", severity: "medium" },
      ],
      Fruiting: [
        { pest: "Pink Bollworm", severity: "high", treatmentProductName: "Terminator", notes: "Set up pheromone traps early." },
        { pest: "American Bollworm", severity: "high", treatmentProductName: "Terminator" },
      ],
      Maturity: [
        { pest: "Pink Bollworm", severity: "medium", treatmentProductName: "Terminator" },
      ],
    },
    monthlyPressure: [0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1],
    scoutingChecklist: [
      { month: "June", task: "Monitor seedlings for sucking pests (Aphids, Thrips)." },
      { month: "July", task: "Check for Jassid hopper burn on leaf margins." },
      { month: "August", task: "Install yellow sticky traps for Whitefly." },
      { month: "September", task: "Scout for early Bollworm damage on squares." },
      { month: "October", task: "Check cotton bolls for Pink Bollworm signs. Set up pheromone traps." },
      { month: "November", task: "Monitor open bolls; harvest mature bolls promptly." },
    ],
  },
  {
    crop: "Soybean",
    stages: {
      Seedling: [
        { pest: "Stem Fly", severity: "medium", treatmentProductName: "Phantom" },
      ],
      Vegetative: [
        { pest: "Semilooper", severity: "high", treatmentProductName: "Terminator", notes: "Active in high humidity." },
        { pest: "Girdle Beetle", severity: "medium" },
      ],
      Flowering: [
        { pest: "Semilooper", severity: "high", treatmentProductName: "Terminator" },
        { pest: "Tobacco Caterpillar", severity: "high", treatmentProductName: "Terminator" },
      ],
      Fruiting: [
        { pest: "Pod Borer", severity: "high", treatmentProductName: "Terminator" },
      ],
      Maturity: [
        { pest: "Pod Borer", severity: "medium", treatmentProductName: "Terminator" },
      ],
    },
    monthlyPressure: [0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 0, 0],
    scoutingChecklist: [
      { month: "June", task: "Check seedlings for Stem Fly tunneling." },
      { month: "July", task: "Scout for Semilooper — peak pressure due to humidity." },
      { month: "August", task: "Install pheromone traps for Tobacco Caterpillar." },
      { month: "September", task: "Inspect pods for borer damage before harvest." },
    ],
  },
  {
    crop: "Onion",
    stages: {
      Seedling: [
        { pest: "Damping-off (fungal)", severity: "high", notes: "Use seed treatment." },
      ],
      Vegetative: [
        { pest: "Thrips", severity: "high", treatmentProductName: "Jaguar" },
      ],
      Flowering: [
        { pest: "Thrips", severity: "high", treatmentProductName: "Jaguar" },
        { pest: "Purple Blotch (fungal)", severity: "medium" },
      ],
      Fruiting: [
        { pest: "Thrips", severity: "medium", treatmentProductName: "Jaguar" },
      ],
      Maturity: [
        { pest: "Bulb rot", severity: "medium" },
      ],
    },
    monthlyPressure: [2, 2, 3, 3, 1, 1, 2, 2, 2, 2, 2, 2],
    scoutingChecklist: [
      { month: "March", task: "Peak Thrips pressure — scout twice weekly." },
      { month: "April", task: "Watch for Purple Blotch in humid spells." },
    ],
  },
];

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const pressureColor = (level: number) => {
  if (level >= 3) return "bg-destructive text-destructive-foreground";
  if (level === 2) return "bg-accent text-accent-foreground";
  if (level === 1) return "bg-primary/30 text-foreground";
  return "bg-muted text-muted-foreground";
};

export const pressureLabel = (level: number) => {
  if (level >= 3) return "Peak";
  if (level === 2) return "High";
  if (level === 1) return "Low";
  return "None";
};