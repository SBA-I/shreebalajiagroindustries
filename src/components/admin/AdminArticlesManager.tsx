import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Row { id: string; slug: string; title: string; category: string; is_published: boolean; }
const blank = { slug: "", title: "", excerpt: "", body: "", category: "sustainability", hero_image_url: "" };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminArticlesManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("sustainability_articles").select("id, slug, title, category, is_published").order("published_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || slugify(form.title);
    if (!form.title || !form.body || !slug) return toast.error("Title and body are required");
    setBusy(true);
    const { error } = await supabase.from("sustainability_articles").insert({
      slug, title: form.title, excerpt: form.excerpt || null, body: form.body,
      category: form.category, hero_image_url: form.hero_image_url || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Article published");
    setForm(blank);
    refresh();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("sustainability_articles").update({ is_published: !current }).eq("id", id);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("sustainability_articles").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">New article</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from title" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                  <SelectItem value="ipm">IPM</SelectItem>
                  <SelectItem value="soil">Soil Health</SelectItem>
                  <SelectItem value="rnd">R&amp;D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Hero image URL</Label><Input value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Body (Markdown) *</Label><Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Articles ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.category} · {r.is_published ? "Published" : "Draft"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => togglePublish(r.id, r.is_published)}>{r.is_published ? "Unpublish" : "Publish"}</Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminArticlesManager;