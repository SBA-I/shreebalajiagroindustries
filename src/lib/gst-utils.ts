// GST state codes extracted from first 2 digits of GSTIN
const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
  "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar",
  "36": "Telangana", "37": "Andhra Pradesh (New)",
};

// Company GSTIN (placeholder – replace with real)
export const COMPANY_GSTIN = "27AABCS1234A1Z5";
export const COMPANY_STATE_CODE = "27"; // Maharashtra

export const GST_RATE = 18; // 18% GST on agrochemicals

export function getStateFromGSTIN(gstin: string): { code: string; name: string } | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  const name = STATE_CODES[code];
  return name ? { code, name } : null;
}

export function isIntraState(distributorGSTIN: string): boolean {
  const distState = getStateFromGSTIN(distributorGSTIN);
  return distState?.code === COMPANY_STATE_CODE;
}

export interface GSTBreakdown {
  subtotal: number;
  gstRate: number;
  isIntraState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  grandTotal: number;
}

export function calculateGST(subtotal: number, distributorGSTIN: string): GSTBreakdown {
  const intra = isIntraState(distributorGSTIN);
  const totalGST = Math.round((subtotal * GST_RATE) / 100);

  if (intra) {
    const half = Math.round(totalGST / 2);
    return {
      subtotal,
      gstRate: GST_RATE,
      isIntraState: true,
      cgst: half,
      sgst: totalGST - half,
      igst: 0,
      totalGST,
      grandTotal: subtotal + totalGST,
    };
  }

  return {
    subtotal,
    gstRate: GST_RATE,
    isIntraState: false,
    cgst: 0,
    sgst: 0,
    igst: totalGST,
    totalGST,
    grandTotal: subtotal + totalGST,
  };
}
