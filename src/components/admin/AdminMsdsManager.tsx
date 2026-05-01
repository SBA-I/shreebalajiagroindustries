import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Upload, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Doc {
  id: string;
  product_name: string;
  language: string;
  version: string | null;
  file_url: string;
  file_size_kb: number | null;
}

const AdminMsdsManager = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [language, setLanguage] = useState("en");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("msds_documents")
      .select("id, product_name, language, version, file_url, file_size_kb")
      .order("created_at", { ascending: false });
    setDocs((data ?? []) as Doc[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) return toast.error("Product name and file are required");
    setBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from("msds").upload(path, file, { upsert: false });
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("msds").getPublicUrl(path);
    const { error: insErr } = await supabase.from("msds_documents").insert({
      product_name: name.trim(),
      language,
      version: version.trim() || null,
      file_url: pub.publicUrl,
      file_size_kb: Math.round(file.size / 1024),
    });
    setBusy(false);
    if (insErr) return toast.error(insErr.message);
    toast.success("MSDS uploaded");
    setName(""); setVersion(""); setLanguage("en"); setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this MSDS?")) return;
    const { error } = await supabase.from("msds_documents").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload new MSDS</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Product Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jaquar 80% WP" />
            </div>
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2026.1" />
            </div>
            <div className="md:col-span-3">
              <Label>PDF File</Label>
              <Input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
        <CardHeader><CardTitle className="text-base">Existing MSDS ({docs.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No MSDS uploaded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.product_name}</p>
                    <p className="text-xs text-muted-foreground">{d.language.toUpperCase()} {d.version && `· v${d.version}`} {d.file_size_kb && `· ${d.file_size_kb} KB`}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button asChild size="icon" variant="ghost"><a href={d.file_url} target="_blank" rel="noopener"><FileDown className="h-4 w-4" /></a></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminMsdsManager;