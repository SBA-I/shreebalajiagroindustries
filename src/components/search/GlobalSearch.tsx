import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Newspaper, BookOpen, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useProducts } from "@/hooks/use-db-products";
import { useNews } from "@/hooks/use-news";
import { useResources } from "@/hooks/use-resources";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const useDealersLite = () =>
  useQuery({
    queryKey: ["dealers-search"],
    queryFn: async () => {
      const { data } = await supabase.rpc("list_dealer_talukas_public");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

const GlobalSearch = ({ variant = "icon" }: { variant?: "icon" | "input" }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: news = [] } = useNews();
  const { data: resources = [] } = useResources();
  const { data: dealerTalukas = [] } = useDealersLite();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {variant === "icon" ? (
        <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setOpen(true)}>
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground bg-muted/40 border border-border rounded-md hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search products, news, dealers…</span>
          <kbd className="ml-auto hidden sm:inline-block text-[10px] bg-background border border-border rounded px-1.5 py-0.5">Ctrl+K</kbd>
        </button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, news, articles, dealers..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {products.length > 0 && (
            <CommandGroup heading="Products">
              {products.slice(0, 30).map((p) => (
                <CommandItem key={p.id} value={`product ${p.name} ${p.technicalName ?? ""} ${(p.targetCrops ?? []).join(" ")} ${(p.targetPests ?? []).join(" ")}`} onSelect={() => go(`/products/${p.slug}`)}>
                  <Package className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{p.name}</p>
                    {p.technicalName && <p className="text-xs text-muted-foreground truncate">{p.technicalName}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {news.length > 0 && (
            <CommandGroup heading="News">
              {news.slice(0, 15).map((n) => (
                <CommandItem key={n.id} value={`news ${n.title} ${n.excerpt}`} onSelect={() => go(`/news/${n.slug}`)}>
                  <Newspaper className="h-4 w-4 mr-2 text-primary" />
                  <span className="truncate">{n.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {resources.length > 0 && (
            <CommandGroup heading="Resources">
              {resources.slice(0, 15).map((r: any) => (
                <CommandItem key={r.id} value={`resource ${r.title} ${r.excerpt ?? ""}`} onSelect={() => go(`/resources/${r.slug}`)}>
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  <span className="truncate">{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {dealerTalukas.length > 0 && (
            <CommandGroup heading="Dealer Areas">
              {(dealerTalukas as any[]).slice(0, 10).map((d, i) => (
                <CommandItem key={i} value={`dealer ${d.taluka} ${d.district} ${d.state}`} onSelect={() => go(`/find-dealer`)}>
                  <Store className="h-4 w-4 mr-2 text-primary" />
                  <span className="truncate">{d.taluka}, {d.district} ({d.dealer_count})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;