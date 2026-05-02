import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditDialog from "./EditDialog";

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "crop-protection", label: "Crop Protection" },
  { value: "application", label: "Application Techniques" },
  { value: "safety", label: "Safety & Compliance" },
  { value: "ipm", label: "IPM" },
  { value: "seasonal", label: "Seasonal Care" },
  { value: "soil-health", label: "Soil Health" },
  { value: "sustainability", label: "Sustainability" },
  { value: "rnd", label: "R&D" },
];

const TYPES = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "guide", label: "Guide" },
];

interface Row {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: string;
  type: string;
  author: string | null;
  author_role: string | null;
  display_date: string | null;
  read_time: string | null;
  tags: string[] | null;
  content: string[] | null;
  hero_image_url: string | null;
  featured: boolean;
  is_published: boolean;
  sort_order: number;
}

const blank = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "crop-protection",
  type: "article",
  author: "",
  author_role: "",
  display_date: "",
  read_time: "5 min read",
  tags: "",
  content: "",
  hero_image_url: "",
  featured: false,
  is_published: true,
  sort_order: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const splitTags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
const splitParas = (s: string) => s.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

const AdminResourcesManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sustainability_articles")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || slugify(form.title);
    if (!form.title || !slug) return toast.error("Title is required");
    const contentArr = splitParas(form.content);
    setBusy(true);
    const { error } = await supabase.from("sustainability_articles").insert({
      slug,
      title: form.title,
      excerpt: form.excerpt || null,
      body: contentArr.join("\n\n") || form.body || form.excerpt || "",
      category: form.category,
      type: form.type,
      author: form.author || null,
      author_role: form.author_role || null,
      display_date: form.display_date || null,
      read_time: form.read_time || null,
      tags: splitTags(form.tags),
      content: contentArr,
      hero_image_url: form.hero_image_url || null,
      featured: form.featured,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Resource added");
    setForm(blank);
    refresh();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("sustainability_articles").update({ is_published: !current }).eq("id", id);
    refresh();
  };
  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("sustainability_articles").update({ featured: !current }).eq("id", id);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("sustainability_articles").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from title" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div><Label>Author role</Label><Input value={form.author_role} onChange={(e) => setForm({ ...form, author_role: e.target.value })} /></div>
            <div><Label>Date (e.g. 2026-03-01)</Label><Input value={form.display_date} onChange={(e) => setForm({ ...form, display_date: e.target.value })} /></div>
            <div><Label>Read time</Label><Input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min read" /></div>
            <div className="md:col-span-2"><Label>Hero image URL</Label><Input value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div className="md:col-span-2">
              <Label>Content (separate paragraphs with a blank line, **bold** supported)</Label>
              <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>Featured</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Published</Label></div>
            <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={busy} className="gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add resource
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Resources ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.type} · {r.category} · {r.is_published ? "Published" : "Draft"}{r.featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    <Button size="sm" variant="outline" onClick={() => togglePublish(r.id, r.is_published)}>{r.is_published ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleFeatured(r.id, r.featured)}>{r.featured ? "Unfeature" : "Feature"}</Button>
                    <EditResourceButton row={r} onSaved={refresh} />
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

export default AdminResourcesManager;

const EditResourceButton = ({ row, onSaved }: { row: Row; onSaved: () => void }) => {
  const [draft, setDraft] = useState({
    title: row.title,
    slug: row.slug,
    category: row.category,
    type: row.type,
    author: row.author ?? "",
    author_role: row.author_role ?? "",
    display_date: row.display_date ?? "",
    read_time: row.read_time ?? "",
    tags: (row.tags ?? []).join(", "),
    excerpt: row.excerpt ?? "",
    content: (row.content ?? []).join("\n\n") || row.body || "",
    hero_image_url: row.hero_image_url ?? "",
    featured: row.featured,
    is_published: row.is_published,
    sort_order: row.sort_order,
  });
  const save = async () => {
    const contentArr = splitParas(draft.content);
    const { error } = await supabase.from("sustainability_articles").update({
      title: draft.title,
      slug: draft.slug,
      category: draft.category,
      type: draft.type,
      author: draft.author || null,
      author_role: draft.author_role || null,
      display_date: draft.display_date || null,
      read_time: draft.read_time || null,
      tags: splitTags(draft.tags),
      excerpt: draft.excerpt || null,
      body: contentArr.join("\n\n") || draft.excerpt || "",
      content: contentArr,
      hero_image_url: draft.hero_image_url || null,
      featured: draft.featured,
      is_published: draft.is_published,
      sort_order: Number(draft.sort_order) || 0,
    }).eq("id", row.id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated");
    onSaved();
  };
  return (
    <EditDialog title={`Edit ${row.title}`} onSave={save}>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
        <div><Label>Slug</Label><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
        <div>
          <Label>Category</Label>
          <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Author</Label><Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></div>
        <div><Label>Author role</Label><Input value={draft.author_role} onChange={(e) => setDraft({ ...draft, author_role: e.target.value })} /></div>
        <div><Label>Date</Label><Input value={draft.display_date} onChange={(e) => setDraft({ ...draft, display_date: e.target.value })} /></div>
        <div><Label>Read time</Label><Input value={draft.read_time} onChange={(e) => setDraft({ ...draft, read_time: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Hero image URL</Label><Input value={draft.hero_image_url} onChange={(e) => setDraft({ ...draft, hero_image_url: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Tags (comma separated)</Label><Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Excerpt</Label><Textarea rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Content (paragraphs separated by blank line)</Label><Textarea rows={10} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={draft.featured} onCheckedChange={(v) => setDraft({ ...draft, featured: v })} /><Label>Featured</Label></div>
        <div className="flex items-center gap-2"><Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} /><Label>Published</Label></div>
        <div><Label>Sort order</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></div>
      </div>
    </EditDialog>
  );
};