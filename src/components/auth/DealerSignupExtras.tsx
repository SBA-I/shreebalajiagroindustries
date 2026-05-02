import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import type { ExtraFieldsData } from "./RoleAuthForm";

// Indian GSTIN (15 chars): 2 digit state + 10 char PAN (5 letters + 4 digits + 1 letter)
// + 1 entity (alphanumeric) + 'Z' + 1 alphanumeric checksum.
// Used standalone for typed input and as a pattern (without anchors) for OCR scan.
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const GSTIN_SCAN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z][0-9A-Z]Z[0-9A-Z]/;

interface Props {
  value: ExtraFieldsData;
  onChange: (next: ExtraFieldsData) => void;
}

export const validateDealerExtras = (v: ExtraFieldsData): string | null => {
  if (!v.shop_name || String(v.shop_name).trim().length < 2) return "Shop / firm name is required";
  if (!v.gst_number || !GSTIN_REGEX.test(String(v.gst_number).toUpperCase()))
    return "Enter a valid 15-character GST number (e.g. 27AAACB1234C1Z5)";
  if (!v.license_number || String(v.license_number).trim().length < 3)
    return "License number is required";
  if (!v.shop_address || String(v.shop_address).trim().length < 5) return "Shop address is required";
  return null;
};

export const dealerExtrasToMetadata = (v: ExtraFieldsData) => ({
  shop_name: v.shop_name || null,
  gst_number: v.gst_number ? String(v.gst_number).toUpperCase() : null,
  license_number: v.license_number || null,
  shop_address: v.shop_address || null,
  shop_lat: v.shop_lat ? String(v.shop_lat) : null,
  shop_lng: v.shop_lng ? String(v.shop_lng) : null,
});

const DealerSignupExtras = ({ value, onChange }: Props) => {
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [gpsBusy, setGpsBusy] = useState(false);

  const handleGstFile = async (file: File) => {
    setOcrBusy(true);
    setOcrStatus("idle");
    try {
      // Lazy-load tesseract to keep the auth bundle small
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng");
      const text = (data.text || "").toUpperCase();
      const match = text.match(GSTIN_SCAN_REGEX);
      if (match) {
        onChange({ ...value, gst_number: match[0] });
        setOcrStatus("ok");
      } else {
        setOcrStatus("fail");
      }
    } catch {
      setOcrStatus("fail");
    } finally {
      setOcrBusy(false);
    }
  };

  const captureGps = () => {
    if (!navigator.geolocation) return;
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...value,
          shop_lat: pos.coords.latitude.toFixed(6),
          shop_lng: pos.coords.longitude.toFixed(6),
        });
        setGpsBusy(false);
      },
      () => setGpsBusy(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Business details (verified by admin)
      </p>

      <div>
        <Label htmlFor="d-shop">Shop / Firm name *</Label>
        <Input
          id="d-shop"
          value={(value.shop_name as string) ?? ""}
          onChange={(e) => onChange({ ...value, shop_name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="d-gst-file" className="flex items-center gap-1.5">
          <ScanLine className="h-3.5 w-3.5" /> Scan GST certificate (auto-fill)
        </Label>
        <Input
          id="d-gst-file"
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleGstFile(e.target.files[0])}
          disabled={ocrBusy}
        />
        {ocrBusy && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Reading certificate…
          </p>
        )}
        {ocrStatus === "ok" && (
          <p className="text-[11px] text-primary flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> GST number detected and filled.
          </p>
        )}
        {ocrStatus === "fail" && (
          <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> Couldn't detect a GSTIN. Please type it below.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="d-gst">GST number *</Label>
        <Input
          id="d-gst"
          value={(value.gst_number as string) ?? ""}
          onChange={(e) => onChange({ ...value, gst_number: e.target.value.toUpperCase() })}
          placeholder="27AAACB1234C1Z5"
          maxLength={15}
        />
      </div>

      <div>
        <Label htmlFor="d-lic">License number *</Label>
        <Input
          id="d-lic"
          value={(value.license_number as string) ?? ""}
          onChange={(e) => onChange({ ...value, license_number: e.target.value })}
          placeholder="Pesticide / Seed / Fertilizer license"
        />
      </div>

      <div>
        <Label htmlFor="d-addr">Shop address *</Label>
        <Input
          id="d-addr"
          value={(value.shop_address as string) ?? ""}
          onChange={(e) => onChange({ ...value, shop_address: e.target.value })}
        />
        <button
          type="button"
          onClick={captureGps}
          className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1 disabled:opacity-50"
          disabled={gpsBusy}
        >
          {gpsBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "📍"} Tag current GPS location
        </button>
        {value.shop_lat && value.shop_lng && (
          <p className="text-[11px] text-muted-foreground">
            {String(value.shop_lat)}, {String(value.shop_lng)}
          </p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">
        Your account will be reviewed by our team. You can sign in immediately, but distributor
        pricing & ordering unlock after approval.
      </p>
    </div>
  );
};

export default DealerSignupExtras;