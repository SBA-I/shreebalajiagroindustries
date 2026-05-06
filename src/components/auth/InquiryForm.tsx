import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type InquiryRole = "farmer" | "distributor" | "field_officer";

const baseSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

interface Props {
  role: InquiryRole;
}

const ROLE_CONFIG: Record<InquiryRole, { label: string; extras: { key: string; label: string; placeholder?: string; required?: boolean }[] }> = {
  farmer: {
    label: "Farmer Inquiry",
    extras: [
      { key: "village", label: "Village", required: true },
      { key: "state", label: "State / District", required: true },
      { key: "crop", label: "Crop / Issue", placeholder: "e.g. Cotton — bollworm attack" },
    ],
  },
  distributor: {
    label: "Distributor / Dealer Inquiry",
    extras: [
      { key: "shop_name", label: "Shop / Firm Name", required: true },
      { key: "city", label: "City & State", required: true },
      { key: "gst", label: "GST Number (optional)" },
    ],
  },
  field_officer: {
    label: "Field Officer Inquiry",
    extras: [
      { key: "territory", label: "Territory / Region", required: true },
      { key: "experience", label: "Years of Experience" },
    ],
  },
};

const InquiryForm = ({ role }: Props) => {
  const cfg = ROLE_CONFIG[role];
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});

  const updateExtra = (k: string, v: string) => setExtras((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = baseSchema.safeParse({ name, email, phone, message });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    for (const f of cfg.extras) {
      if (f.required && !extras[f.key]?.trim()) return toast.error(`${f.label} is required`);
    }
    setBusy(true);
    const detailLines = cfg.extras
      .filter((f) => extras[f.key]?.trim())
      .map((f) => `${f.label}: ${extras[f.key].trim()}`);
    const fullMessage = [...detailLines, "", parsed.data.message].join("\n").trim();
    const { error } = await supabase.from("contact_inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      inquiry_type: role,
      message: fullMessage,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Inquiry submitted! Our team will reach out soon.");
    setName(""); setEmail(""); setPhone(""); setMessage(""); setExtras({});
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Have a question before signing up? Send us your inquiry and our team will respond.
      </p>
      <div>
        <Label htmlFor="iq-name">Full Name *</Label>
        <Input id="iq-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="iq-email">Email *</Label>
          <Input id="iq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="iq-phone">Phone *</Label>
          <Input id="iq-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>
      {cfg.extras.map((f) => (
        <div key={f.key}>
          <Label htmlFor={`iq-${f.key}`}>{f.label}{f.required ? " *" : ""}</Label>
          <Input
            id={`iq-${f.key}`}
            placeholder={f.placeholder}
            value={extras[f.key] ?? ""}
            onChange={(e) => updateExtra(f.key, e.target.value)}
          />
        </div>
      ))}
      <div>
        <Label htmlFor="iq-message">Your Message *</Label>
        <Textarea
          id="iq-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Submit ${cfg.label}`}
      </Button>
    </form>
  );
};

export default InquiryForm;