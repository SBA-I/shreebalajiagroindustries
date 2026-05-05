import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, CheckCircle2, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Doc { id: string; product_name: string; file_url: string; language: string; }
interface Article { id: string; title: string; excerpt: string | null; }

const CACHE_KEY = "fo_offline_cache_v1";

const OfflineKnowledgeBase = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const obj = JSON.parse(raw);
      setDocs(obj.docs || []); setArticles(obj.articles || []);
      setCachedAt(obj.cachedAt || null);
      return true;
    } catch { return false; }
  };

  const fetchFresh = async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      supabase.from("msds_documents").select("id,product_name,file_url,language").eq("is_active", true).limit(50),
      supabase.from("sustainability_articles").select("id,title,excerpt").eq("is_published", true).limit(50),
    ]);
    setDocs((m.data ?? []) as Doc[]);
    setArticles((s.data ?? []) as Article[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!loadFromCache()) fetchFresh();
    else setLoading(false);
  }, []);

  const sync = async () => {
    setSyncing(true);
    try {
      await fetchFresh();
      const payload = { docs, articles, cachedAt: new Date().toISOString() };
      // Re-pull and store atomically
      const [m, s] = await Promise.all([
        supabase.from("msds_documents").select("id,product_name,file_url,language").eq("is_active", true).limit(50),
        supabase.from("sustainability_articles").select("id,title,excerpt").eq("is_published", true).limit(50),
      ]);
      const fresh = { docs: m.data ?? [], articles: s.data ?? [], cachedAt: new Date().toISOString() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      setDocs(fresh.docs as Doc[]); setArticles(fresh.articles as Article[]); setCachedAt(fresh.cachedAt);
      toast.success("Knowledge base synced for offline use");
    } catch (e: any) { toast.error(e.message); }
    finally { setSyncing(false); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Offline Knowledge Base
          {!online && <WifiOff className="h-4 w-4 text-destructive" />}
        </CardTitle>
        <Button size="sm" onClick={sync} disabled={syncing || !online}>
          {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
          Sync for Offline
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {cachedAt && (
          <p className="text-xs text-primary flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Cached on {new Date(cachedAt).toLocaleString()}
          </p>
        )}
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>
            <div>
              <h4 className="font-medium mb-1">MSDS / Technical ({docs.length})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {docs.map(d => (
                  <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs hover:text-primary">
                    <FileText className="h-3 w-3" /> {d.product_name} <span className="text-muted-foreground">({d.language})</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1 mt-3">IPM / Sustainability ({articles.length})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {articles.map(a => (
                  <div key={a.id} className="text-xs">
                    <div className="font-medium">{a.title}</div>
                    {a.excerpt && <div className="text-muted-foreground line-clamp-1">{a.excerpt}</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineKnowledgeBase;