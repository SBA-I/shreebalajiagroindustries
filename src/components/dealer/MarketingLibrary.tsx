import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Download, FileText, Image as ImageIcon, Video, Megaphone, Search, FileType2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Asset {
  id: string;
  title: string;
  description: string | null;
  asset_type: string;
  file_url: string;
  thumbnail_url: string | null;
}

const TYPE_META: Record<string, { label: string; Icon: any; tone: string }> = {
  catalog:   { label: "Product Catalog",  Icon: FileText, tone: "bg-amber-100 text-amber-800" },
  social:    { label: "Social Media",     Icon: ImageIcon, tone: "bg-blue-100 text-blue-800" },
  video:     { label: "Explainer Video",  Icon: Video, tone: "bg-purple-100 text-purple-800" },
  printable: { label: "Printable",        Icon: FileType2, tone: "bg-emerald-100 text-emerald-800" },
  bulletin:  { label: "Tech Bulletin",    Icon: FileText, tone: "bg-rose-100 text-rose-800" },
  banner:    { label: "Banner",           Icon: Megaphone, tone: "bg-amber-100 text-amber-800" },
  poster:    { label: "Poster",           Icon: ImageIcon, tone: "bg-blue-100 text-blue-800" },
};

const TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "catalog", label: "Catalog" },
  { key: "social", label: "Social" },
  { key: "video", label: "Videos" },
  { key: "printable", label: "Printables" },
  { key: "bulletin", label: "Bulletins" },
];

const MarketingLibrary = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketing_assets")
        .select("id,title,description,asset_type,file_url,thumbnail_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) toast.error("Could not load brand assets");
      setAssets((data ?? []) as Asset[]);
      setLoading(false);
    })();
  }, []);

  const filtered = assets.filter((a) => {
    if (tab !== "all" && a.asset_type !== tab) return false;
    if (q && !a.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Marketing Library
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          High-quality SBA visuals, catalogs, and explainer videos. Download and share on WhatsApp Status, Facebook, or print for your shop.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search assets…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "outline"}
              className="shrink-0"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
            No assets in this category yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((a) => {
              const meta = TYPE_META[a.asset_type] ?? { label: a.asset_type, Icon: FileText, tone: "bg-muted text-muted-foreground" };
              const Icon = meta.Icon;
              const isImage = a.thumbnail_url && /\.(jpe?g|png|webp|gif)$/i.test(a.thumbnail_url);
              return (
                <div key={a.id} className="rounded-lg border border-border overflow-hidden flex flex-col bg-card hover:border-primary transition-colors">
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img src={a.thumbnail_url!} alt={a.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="h-10 w-10 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{a.title}</h3>
                      <Badge className={`${meta.tone} text-[10px] shrink-0`}>{meta.label}</Badge>
                    </div>
                    {a.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                    )}
                    <Button asChild size="sm" className="mt-auto gap-1.5">
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketingLibrary;
