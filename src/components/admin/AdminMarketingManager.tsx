import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Upload, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDialog from "./EditDialog";
import { notifySubscribers } from "@/lib/notify";

interface Asset {
  id: string;
  title: string;
  description: string | null;
  asset_type: string;
  file_url: string;
  audience?: string;
}

const TYPE_OPTIONS = [
  { value: "catalog", label: "Product Catalog (PDF)" },
  { value: "social", label: "Social Media Image" },
  { value: "video", label: "Explainer Video" },
  { value: "printable", label: "Printable (Banner/Pamphlet)" },
  { value: "bulletin", label: "Technical Bulletin (PDF)" },
  { value: "banner", label: "Banner" },
  { value: "poster", label: "Poster" },
  { value: "other", label: "Other" },
];
const AUDIENCE_OPTIONS = [
  { value: "dealers", label: "Dealers only" },
  { value: "public", label: "Public" },
];

const AdminMarketingManager = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("catalog");
  const [audience, setAudience] = useState("dealers");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketing_assets").select("id, title, description, asset_type, file_url, audience").order("created_at", { ascending: false });
    setAssets((data ?? []) as Asset[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return toast.error("Title and file required");
    setBusy(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from("marketing-kit").upload(path, file);
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("marketing-kit").getPublicUrl(path);
    const { error } = await supabase.from("marketing_assets").insert({
      title: title.trim(),
      description: description.trim() || null,
      asset_type: type,
      file_url: pub.publicUrl,
      thumbnail_url: pub.publicUrl,
      audience,
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Asset uploaded");
    if (audience === "public") {
      notifySubscribers("marketing", {
        title: title.trim(),
        excerpt: description.trim() || undefined,
        hero_image_url: pub.publicUrl,
      });
    }
    setTitle(""); setDescription(""); setType("catalog"); setAudience("dealers"); setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    await supabase.from("marketing_assets").delete().eq("id", id);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload marketing asset</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>File</Label>
              <Input ref={fileRef} type="file" accept="image/*,video/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif,.svg,.mp4,.mov,.webm,.mkv,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="md:col-span-3">
              <Label>Description</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" disabled={busy} className="w-full gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Existing assets ({assets.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : assets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No assets yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.asset_type} · {a.audience ?? "dealers"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild size="icon" variant="ghost"><a href={a.file_url} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /></a></Button>
                    <EditAssetButton asset={a} onSaved={refresh} />
                    <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMarketingManager;

const EditAssetButton = ({ asset, onSaved }: { asset: Asset; onSaved: () => void }) => {
  const [draft, setDraft] = useState({
    title: asset.title, description: asset.description ?? "", asset_type: asset.asset_type, audience: asset.audience ?? "dealers",
  });
  const save = async () => {
    const { error } = await supabase.from("marketing_assets").update({
      title: draft.title, description: draft.description || null, asset_type: draft.asset_type, audience: draft.audience,
    } as any).eq("id", asset.id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    onSaved();
  };
  return (
    <EditDialog title={`Edit ${asset.title}`} onSave={save}>
      <div><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
      <div>
        <Label>Category</Label>
        <Select value={draft.asset_type} onValueChange={(v) => setDraft({ ...draft, asset_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Audience</Label>
        <Select value={draft.audience} onValueChange={(v) => setDraft({ ...draft, audience: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUDIENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Description</Label><Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
    </EditDialog>
  );
};