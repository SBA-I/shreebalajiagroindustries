// Offline first-aid database keyed by chemical category.
// Stored locally so the Emergency button works without network.

export type ChemCategory = "insecticides" | "fungicides" | "herbicides" | "pgr";
export type ExposureType = "skin" | "eye" | "inhalation" | "ingestion";

export interface FirstAidStep {
  step: number;
  text: string;
}

export interface FirstAidProtocol {
  category: ChemCategory;
  categoryLabel: string;
  toxicityClass: "II - Moderately Toxic" | "III - Slightly Toxic" | "IV - Practically Non-Toxic";
  ppeClass: "A" | "B" | "C";
  exposures: Record<ExposureType, FirstAidStep[]>;
  doNot: string[];
  antidote?: string;
}

const COMMON_END: FirstAidStep[] = [
  { step: 99, text: "Call National Poison Helpline 1800-11-8600 immediately and carry the product label / MSDS to the hospital." },
];

export const FIRST_AID: Record<ChemCategory, FirstAidProtocol> = {
  insecticides: {
    category: "insecticides",
    categoryLabel: "Insecticide",
    toxicityClass: "II - Moderately Toxic",
    ppeClass: "B",
    exposures: {
      skin: [
        { step: 1, text: "Move the person to fresh air immediately." },
        { step: 2, text: "Remove contaminated clothing, shoes and watches." },
        { step: 3, text: "Wash exposed skin with plenty of soap and clean water for at least 15 minutes." },
        { step: 4, text: "Do NOT scrub the skin — pat dry with a clean cloth." },
        ...COMMON_END,
      ],
      eye: [
        { step: 1, text: "Hold the eyelid open and rinse with clean running water for at least 15–20 minutes." },
        { step: 2, text: "Remove contact lenses after the first 5 minutes if easy to do." },
        { step: 3, text: "Continue rinsing while transporting to the hospital." },
        ...COMMON_END,
      ],
      inhalation: [
        { step: 1, text: "Move the person into fresh open air at once." },
        { step: 2, text: "Loosen tight clothing around the neck and chest." },
        { step: 3, text: "If breathing has stopped, give artificial respiration (avoid mouth-to-mouth — use a barrier)." },
        { step: 4, text: "Keep the person warm and at rest until medical help arrives." },
        ...COMMON_END,
      ],
      ingestion: [
        { step: 1, text: "Do NOT induce vomiting unless told to by a doctor or poison centre." },
        { step: 2, text: "Rinse the mouth with water — do not swallow." },
        { step: 3, text: "If the person is conscious, give small sips of water." },
        { step: 4, text: "Never give anything by mouth to an unconscious person." },
        ...COMMON_END,
      ],
    },
    doNot: [
      "Do not give milk, oil or alcohol — fats accelerate absorption of organophosphates.",
      "Do not leave the person alone.",
      "Do not re-use contaminated clothing without washing thoroughly.",
    ],
    antidote: "If product contains organophosphate / carbamate, the medical antidote is Atropine Sulphate (administered by a doctor only).",
  },
  fungicides: {
    category: "fungicides",
    categoryLabel: "Fungicide",
    toxicityClass: "III - Slightly Toxic",
    ppeClass: "B",
    exposures: {
      skin: [
        { step: 1, text: "Remove contaminated clothing immediately." },
        { step: 2, text: "Wash skin with soap and water for at least 15 minutes." },
        { step: 3, text: "If irritation persists, cover with a clean dry dressing." },
        ...COMMON_END,
      ],
      eye: [
        { step: 1, text: "Rinse the eye with clean lukewarm water for 15–20 minutes." },
        { step: 2, text: "Do not rub the eye." },
        { step: 3, text: "Seek medical advice even if the irritation appears mild." },
        ...COMMON_END,
      ],
      inhalation: [
        { step: 1, text: "Move to fresh air and rest in a half-sitting position." },
        { step: 2, text: "Remove dust masks or contaminated PPE." },
        { step: 3, text: "If coughing or chest discomfort persists, get medical help." },
        ...COMMON_END,
      ],
      ingestion: [
        { step: 1, text: "Rinse the mouth thoroughly with water." },
        { step: 2, text: "Do not induce vomiting." },
        { step: 3, text: "Drink small sips of water if conscious." },
        ...COMMON_END,
      ],
    },
    doNot: [
      "Do not induce vomiting.",
      "Do not give anything by mouth if drowsy or unconscious.",
    ],
  },
  herbicides: {
    category: "herbicides",
    categoryLabel: "Herbicide",
    toxicityClass: "III - Slightly Toxic",
    ppeClass: "A",
    exposures: {
      skin: [
        { step: 1, text: "Remove contaminated clothing and gloves at once." },
        { step: 2, text: "Wash the affected area with soap and large amounts of water for 15 minutes." },
        { step: 3, text: "Apply a soothing emollient if mild redness occurs." },
        ...COMMON_END,
      ],
      eye: [
        { step: 1, text: "Flush the eye with clean water for at least 15 minutes, holding the eyelid open." },
        { step: 2, text: "Do not apply any oils, ointments or eye-drops on the way to the hospital." },
        ...COMMON_END,
      ],
      inhalation: [
        { step: 1, text: "Move to a well-ventilated area immediately." },
        { step: 2, text: "Loosen tight clothing." },
        { step: 3, text: "If breathing is difficult, give oxygen if available." },
        ...COMMON_END,
      ],
      ingestion: [
        { step: 1, text: "Do NOT induce vomiting — many herbicides cause oesophageal burns." },
        { step: 2, text: "Rinse the mouth and give small sips of water if conscious." },
        { step: 3, text: "Transport to hospital immediately with the product label." },
        ...COMMON_END,
      ],
    },
    doNot: [
      "Do not induce vomiting (risk of chemical pneumonitis).",
      "Do not give bicarbonate or activated charcoal without medical advice.",
    ],
  },
  pgr: {
    category: "pgr",
    categoryLabel: "Plant Growth Regulator",
    toxicityClass: "IV - Practically Non-Toxic",
    ppeClass: "C",
    exposures: {
      skin: [
        { step: 1, text: "Wash skin with soap and clean water for 10 minutes." },
        { step: 2, text: "Remove and wash contaminated clothing before re-use." },
        ...COMMON_END,
      ],
      eye: [
        { step: 1, text: "Rinse the eye gently with clean water for 10–15 minutes." },
        { step: 2, text: "Seek medical advice if irritation persists." },
        ...COMMON_END,
      ],
      inhalation: [
        { step: 1, text: "Move to fresh air and rest." },
        { step: 2, text: "Seek medical advice if symptoms persist." },
        ...COMMON_END,
      ],
      ingestion: [
        { step: 1, text: "Rinse mouth with water." },
        { step: 2, text: "Do not induce vomiting." },
        { step: 3, text: "Give small sips of water if conscious." },
        ...COMMON_END,
      ],
    },
    doNot: [
      "Do not induce vomiting unnecessarily.",
    ],
  },
};

export const PPE_MATRIX: Record<ChemCategory, { ppeClass: "A" | "B" | "C"; items: string[] }> = {
  insecticides: {
    ppeClass: "B",
    items: ["Nitrile gloves", "N95 respirator", "Chemical goggles", "Long-sleeve coverall", "Rubber boots", "Wide-brim hat"],
  },
  fungicides: {
    ppeClass: "B",
    items: ["Nitrile gloves", "Dust mask", "Goggles", "Long-sleeve shirt + trousers", "Closed shoes"],
  },
  herbicides: {
    ppeClass: "A",
    items: ["Chemical-resistant gloves", "Face shield", "Coverall", "Rubber boots"],
  },
  pgr: {
    ppeClass: "C",
    items: ["Nitrile gloves", "Goggles", "Long-sleeve shirt"],
  },
};

/** Calculate Pesticide Load Index (PLI) for a single spray session. 0–100 scale. */
export function calculatePLI(opts: {
  category: ChemCategory;
  doseMlPerLitre: number;
  areaAcres: number;
  beeFriendly?: boolean;
}) {
  const baseHazard: Record<ChemCategory, number> = {
    insecticides: 8,
    fungicides: 5,
    herbicides: 6,
    pgr: 2,
  };
  const raw = baseHazard[opts.category] * opts.doseMlPerLitre * Math.max(opts.areaAcres, 0.1);
  const score = Math.min(100, Math.round(raw));
  const adjusted = opts.beeFriendly ? Math.max(0, score - 15) : score;
  let band: "low" | "moderate" | "high" | "very-high";
  if (adjusted < 25) band = "low";
  else if (adjusted < 50) band = "moderate";
  else if (adjusted < 75) band = "high";
  else band = "very-high";
  return { score: adjusted, band };
}