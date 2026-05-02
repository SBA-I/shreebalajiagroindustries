import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDialog from "./EditDialog";

const CATEGORIES = ["Insecticides", "Fungicides", "Herbicides", "PGR"] as const;
type Category = typeof CATEGORIES[number];

interface PackPrice { size: string; price: number | null; dosage?: string | null }

interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  short_description: string | null;
  description: string | null;
  technical_name: string | null;
  formulation: string | null;
  dosage: string | null;
  mode_of_action: string | null;
  target_crops: string[] | null;
  target_pests: string[] | null;
  features: string[] | null;
  safety_precautions: string[] | null;
  pack_sizes: string[] | null;
  pricing: PackPrice[] | null;
  price: number | null;
  unit: string | null;
  image_url: string | null;
  is_new: boolean;
  is_active: boolean;
  popularity: number;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const splitList = (s: string | null) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);

const uploadProductImage = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
};

// ---------- Pack pricing editor (re-used) ----------
const PackEditor = ({ value, onChange }: { value: PackPrice[]; onChange: (v: PackPrice[]) => void }) => {
  const update = (i: number, patch: Partial<PackPrice>) => {
    const next = value.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { size: "", price: null, dosage: "" }]);

  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <Input
            placeholder="Pack size (e.g. 250 ml)"
            value={p.size}
            onChange={(e) => update(i, { size: e.target.value })}
            className="col-span-4"
          />
          <Input
            placeholder="Dosage (e.g. 200 ml/acre)"
            value={p.dosage ?? ""}
            onChange={(e) => update(i, { dosage: e.target.value })}
            className="col-span-5"
          />
          <Input
            placeholder="Price ₹"
            type="number"
            step="0.01"
            value={p.price ?? ""}
            onChange={(e) => update(i, { price: e.target.value ? Number(e.target.value) : null })}
            className="col-span-2"
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)} className="col-span-1">
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add pack</Button>
    </div>
  );
};

// ---------- Image upload field (re-used) ----------
const ImageUploadField = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setUploading(true);
    const url = await uploadProductImage(file);
    setUploading(false);
    if (url) onChange(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="Product" className="h-16 w-16 rounded object-cover border border-border" />
        ) : (
          <div className="h-16 w-16 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-1.5">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value && <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")} className="text-destructive">Remove</Button>}
        </div>
      </div>
      <Input placeholder="…or paste an image URL" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

const blankForm = {
  name: "", slug: "", category: "Insecticides" as Category, short_description: "", description: "",
  technical_name: "", formulation: "", dosage: "", mode_of_action: "",
  target_crops: "", target_pests: "", features: "", safety_precautions: "",
  price: "", unit: "L", image_url: "", is_new: false, is_active: true, popularity: "50",
  packs: [] as PackPrice[],
};

const AdminProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blankForm);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts((data ?? []) as unknown as Product[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name required");
    setBusy(true);
    const slug = form.slug || slugify(form.name);
    const cleanPacks = form.packs.filter((p) => p.size.trim());
    const { error } = await supabase.from("products").insert({
      name: form.name.trim(),
      slug,
      category: form.category,
      short_description: form.short_description || null,
      description: form.description || null,
      technical_name: form.technical_name || null,
      formulation: form.formulation || null,
      dosage: form.dosage || null,
      mode_of_action: form.mode_of_action || null,
      target_crops: splitList(form.target_crops),
      target_pests: splitList(form.target_pests),
      features: splitList(form.features),
      safety_precautions: splitList(form.safety_precautions),
      pack_sizes: cleanPacks.map((p) => p.size),
      pricing: cleanPacks,
      price: form.price ? Number(form.price) : null,
      unit: form.unit || "L",
      image_url: form.image_url || null,
      is_new: form.is_new,
      is_active: form.is_active,
      popularity: Number(form.popularity) || 50,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Product added");
    setForm(blankForm);
    refresh();
  };

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    const { error } = await supabase.from("products").update(patch as any).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    refresh();
    return true;
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add product</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Label>Product image</Label>
              <ImageUploadField value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            </div>

            <div className="md:col-span-3"><Label>Short description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="md:col-span-3"><Label>Full description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

            <div><Label>Technical name</Label><Input value={form.technical_name} onChange={(e) => setForm({ ...form, technical_name: e.target.value })} placeholder="e.g. Imidacloprid 17.8% SL" /></div>
            <div><Label>Formulation</Label><Input value={form.formulation} onChange={(e) => setForm({ ...form, formulation: e.target.value })} placeholder="SC / WP / EC" /></div>
            <div><Label>Mode of action</Label><Input value={form.mode_of_action} onChange={(e) => setForm({ ...form, mode_of_action: e.target.value })} placeholder="Systemic / Contact" /></div>
            <div><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="200 ml/acre" /></div>
            <div><Label>Default unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="L / kg" /></div>
            <div><Label>Base price ₹ (optional)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>

            <div className="md:col-span-3">
              <Label>Available packings &amp; prices</Label>
              <PackEditor value={form.packs} onChange={(packs) => setForm({ ...form, packs })} />
            </div>

            <div className="md:col-span-3"><Label>Crops (comma-sep)</Label><Input value={form.target_crops} onChange={(e) => setForm({ ...form, target_crops: e.target.value })} placeholder="Cotton, Soybean" /></div>
            <div className="md:col-span-3"><Label>Pests / Diseases (comma-sep)</Label><Input value={form.target_pests} onChange={(e) => setForm({ ...form, target_pests: e.target.value })} placeholder="Aphid, Jassid" /></div>
            <div className="md:col-span-3"><Label>Features (comma-sep)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Systemic, Long lasting" /></div>
            <div className="md:col-span-3"><Label>Safety precautions (comma-sep)</Label><Input value={form.safety_precautions} onChange={(e) => setForm({ ...form, safety_precautions: e.target.value })} placeholder="Wear gloves, Avoid skin contact" /></div>

            <div className="flex items-center gap-2"><Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} /><Label>Mark as NEW</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            <div><Label>Popularity (0-100)</Label><Input type="number" value={form.popularity} onChange={(e) => setForm({ ...form, popularity: e.target.value })} /></div>

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">Products ({products.length})</CardTitle>
          <Input className="max-w-xs" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => (
                <ProductRow key={p.id} product={p} onUpdate={updateProduct} onDelete={remove} />
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No products match.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProductRow = ({
  product, onUpdate, onDelete,
}: { product: Product; onUpdate: (id: string, patch: Partial<Product>) => Promise<boolean>; onDelete: (id: string) => void }) => {
  const initialPacks: PackPrice[] = (() => {
    if (Array.isArray(product.pricing) && product.pricing.length > 0) return product.pricing;
    if (Array.isArray(product.pack_sizes)) return product.pack_sizes.map((s) => ({ size: s, price: null }));
    return [];
  })();

  const [draft, setDraft] = useState({
    name: product.name,
    slug: product.slug,
    category: product.category,
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    technical_name: product.technical_name ?? "",
    formulation: product.formulation ?? "",
    mode_of_action: product.mode_of_action ?? "",
    dosage: product.dosage ?? "",
    target_crops: (product.target_crops ?? []).join(", "),
    target_pests: (product.target_pests ?? []).join(", "),
    features: (product.features ?? []).join(", "),
    safety_precautions: (product.safety_precautions ?? []).join(", "),
    price: product.price?.toString() ?? "",
    unit: product.unit ?? "L",
    image_url: product.image_url ?? "",
    is_new: product.is_new,
    is_active: product.is_active,
    popularity: product.popularity?.toString() ?? "50",
    packs: initialPacks,
  });

  const save = () => {
    const cleanPacks = draft.packs.filter((p) => p.size.trim());
    return onUpdate(product.id, {
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
      category: draft.category,
      short_description: draft.short_description || null,
      description: draft.description || null,
      technical_name: draft.technical_name || null,
      formulation: draft.formulation || null,
      mode_of_action: draft.mode_of_action || null,
      dosage: draft.dosage || null,
      target_crops: splitList(draft.target_crops),
      target_pests: splitList(draft.target_pests),
      features: splitList(draft.features),
      safety_precautions: splitList(draft.safety_precautions),
      pack_sizes: cleanPacks.map((p) => p.size),
      pricing: cleanPacks,
      price: draft.price ? Number(draft.price) : null,
      unit: draft.unit || "L",
      image_url: draft.image_url || null,
      is_new: draft.is_new,
      is_active: draft.is_active,
      popularity: Number(draft.popularity) || 50,
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="min-w-0 flex items-center gap-3">
        {product.image_url && <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded object-cover border border-border" />}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {product.name}
            {product.is_new && <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded ml-1">NEW</span>}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {product.category} · {product.is_active ? "active" : "hidden"}
            {product.pack_sizes && product.pack_sizes.length > 0 && ` · ${product.pack_sizes.join(" / ")}`}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <EditDialog title={`Edit ${product.name}`} onSave={save}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
            <div>
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v: Category) => setDraft({ ...draft, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Product image</Label>
              <ImageUploadField value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} />
            </div>

            <div><Label>Technical name</Label><Input value={draft.technical_name} onChange={(e) => setDraft({ ...draft, technical_name: e.target.value })} /></div>
            <div><Label>Formulation</Label><Input value={draft.formulation} onChange={(e) => setDraft({ ...draft, formulation: e.target.value })} /></div>
            <div><Label>Mode of action</Label><Input value={draft.mode_of_action} onChange={(e) => setDraft({ ...draft, mode_of_action: e.target.value })} /></div>
            <div><Label>Dosage</Label><Input value={draft.dosage} onChange={(e) => setDraft({ ...draft, dosage: e.target.value })} /></div>
            <div><Label>Base price ₹</Label><Input type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></div>
            <div><Label>Default unit</Label><Input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} /></div>

            <div className="md:col-span-2">
              <Label>Available packings &amp; prices</Label>
              <PackEditor value={draft.packs} onChange={(packs) => setDraft({ ...draft, packs })} />
            </div>

            <div className="md:col-span-2"><Label>Short description</Label><Input value={draft.short_description} onChange={(e) => setDraft({ ...draft, short_description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Crops</Label><Input value={draft.target_crops} onChange={(e) => setDraft({ ...draft, target_crops: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Pests / Diseases</Label><Input value={draft.target_pests} onChange={(e) => setDraft({ ...draft, target_pests: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Features</Label><Input value={draft.features} onChange={(e) => setDraft({ ...draft, features: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Safety precautions</Label><Input value={draft.safety_precautions} onChange={(e) => setDraft({ ...draft, safety_precautions: e.target.value })} /></div>

            <div><Label>Popularity</Label><Input type="number" value={draft.popularity} onChange={(e) => setDraft({ ...draft, popularity: e.target.value })} /></div>
            <div className="flex items-center gap-2 mt-6"><Switch checked={draft.is_new} onCheckedChange={(v) => setDraft({ ...draft, is_new: v })} /><Label>NEW</Label></div>
            <div className="flex items-center gap-2 mt-6"><Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} /><Label>Active</Label></div>
          </div>
        </EditDialog>
        <Button size="icon" variant="ghost" onClick={() => onDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
  );
};

export default AdminProductsManager;
