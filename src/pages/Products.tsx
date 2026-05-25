import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import ProductCard from "@/components/products/ProductCard";
import ComparisonBar from "@/components/products/ComparisonBar";
import VoiceSearchButton from "@/components/products/VoiceSearchButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-db-products";
import { categoryLabels, type ProductCategory } from "@/types/product";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const ITEMS_PER_PAGE = 9;

const Products = () => {
  const { t } = useI18n();
  const sortOptions = [
    { value: "popularity", label: t("products.sort.popular") },
    { value: "name-asc", label: t("products.sort.az") },
    { value: "name-desc", label: t("products.sort.za") },
    { value: "newest", label: t("products.sort.new") },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading } = useProducts();

  const activeCategory = searchParams.get("category") as ProductCategory | null;

  const toggleCategory = (cat: ProductCategory) => {
    const params = new URLSearchParams(searchParams);
    if (activeCategory === cat) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.composition.toLowerCase().includes(q) ||
          p.targetCrops.some((c) => c.toLowerCase().includes(q)) ||
          p.targetPests.some((c) => c.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  }, [products, activeCategory, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold text-foreground mb-3">{t("products.categories")}</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => { setSearchParams({}); setPage(1); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex justify-between ${
                !activeCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              }`}
            >
              {t("products.all")}
              <span className="text-xs text-muted-foreground">{products.length}</span>
            </button>
          </li>
          {(Object.keys(categoryLabels) as ProductCategory[]).map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <li key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex justify-between ${
                    activeCategory === cat ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {categoryLabels[cat]}
                  <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-foreground mb-3">{t("products.quickInfo")}</h3>
        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2">
          <p><span className="font-medium text-foreground">SL</span> – Soluble Liquid</p>
          <p><span className="font-medium text-foreground">EC</span> – Emulsifiable Concentrate</p>
          <p><span className="font-medium text-foreground">WP</span> – Wettable Powder</p>
          <p><span className="font-medium text-foreground">L</span> – Liquid</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{t("products.title")}</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">{t("products.subtitle")}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("products.search")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <VoiceSearchButton
              onTranscript={(text) => {
                setSearch(text);
                setPage(1);
              }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              className="lg:hidden gap-2"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" /> {t("products.filters")}
            </Button>
          </div>

          {activeCategory && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">{t("products.filteringBy")}</span>
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                {categoryLabels[activeCategory]}
                <button onClick={() => setSearchParams({})}><X className="h-3 w-3" /></button>
              </span>
            </div>
          )}

          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <Sidebar />
            </aside>

            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 bg-foreground/50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-card p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-bold text-foreground">{t("products.filters")}</h2>
                    <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
                  </div>
                  <Sidebar />
                </div>
              </div>
            )}

            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">{t("products.none")}</p>
                  <Button variant="link" onClick={() => { setSearch(""); setSearchParams({}); }}>
                    {t("products.clear")}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("products.showing")} {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} {t("products.of")} {filtered.length} {t("products.productsLabel")}
                  </p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginated.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                          {i + 1}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <ComparisonBar />
    </Layout>
  );
};

export default Products;
