import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProductById, useProducts } from "@/hooks/use-db-products";
import { getRelatedProducts } from "@/types/product";
import { ArrowLeft, Shield, AlertTriangle, Beaker, Leaf, Package, FileText, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import PesticideLoadIndicator from "@/components/safety/PesticideLoadIndicator";
import type { ChemCategory } from "@/data/firstAid";
import { supabase } from "@/integrations/supabase/client";

const ProductDetail = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useProductById(productId || "");
  const { data: allProducts = [] } = useProducts();
  const [activeTab, setActiveTab] = useState<"details" | "safety" | "documents">("details");
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [msdsDocs, setMsdsDocs] = useState<Array<{ id: string; language: string; version: string | null; file_url: string; file_size_kb: number | null }>>([]);

  useEffect(() => {
    if (!product?.id) return;
    (async () => {
      const { data } = await supabase
        .from("msds_documents")
        .select("id, language, version, file_url, file_size_kb")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setMsdsDocs(data ?? []);
    })();
  }, [product?.id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/products"><Button variant="default">Back to Products</Button></Link>
        </div>
      </Layout>
    );
  }

  const related = getRelatedProducts(product, allProducts);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingInquiry(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone || null,
        inquiry_type: "product",
        message: `[Product: ${product.name}]\n\n${inquiryForm.message}`,
      });
      if (error) throw error;
      toast.success("Inquiry submitted! We'll get back to you soon.");
      setInquiryForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const tabs = [
    { id: "details" as const, label: "Details & Specifications", icon: Beaker },
    { id: "safety" as const, label: "Safety Guidelines", icon: AlertTriangle },
    { id: "documents" as const, label: "Documents", icon: FileText },
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">
              {product.categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Hero */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-muted rounded-2xl flex items-center justify-center p-8 lg:p-12 relative">
              <img src={product.image} alt={product.name} className="max-h-80 object-contain" />
              {product.isNew && (
                <span className="absolute top-4 right-4 text-sm font-bold bg-accent text-accent-foreground px-3 py-1 rounded-full">NEW</span>
              )}
            </div>

            <div className="space-y-5">
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{product.categoryLabel}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.tagline}</p>
              <p className="text-foreground leading-relaxed">{product.description}</p>

              {product.price && (
                <p className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()} / {product.formulation?.includes("Powder") ? "kg" : "L"}</p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1"><Beaker className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Composition</span></div>
                  <p className="text-sm font-medium text-foreground">{product.composition}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Formulation</span></div>
                  <p className="text-sm font-medium text-foreground">{product.formulation}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1"><Leaf className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Dosage</span></div>
                  <p className="text-sm font-medium text-foreground">{product.dosage}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1"><Package className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">Pack Sizes</span></div>
                  <p className="text-sm font-medium text-foreground">{product.packSizes.join(", ")}</p>
                </div>
              </div>

              {Array.isArray(product.pricing) && product.pricing.length > 0 && (
                <div className="pt-2">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Available Packings</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.pricing.map((row) => (
                      <div
                        key={row.size}
                        className="rounded-xl border border-border bg-card p-4 hover:shadow-elevated hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-heading font-semibold text-foreground">{row.size}</span>
                          </div>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {product.categoryLabel}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xl font-bold text-primary">{row.mrp}</span>
                          <span className="text-[11px] text-muted-foreground">M.R.P.</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                          <div className="flex gap-1.5">
                            <span className="font-medium text-foreground shrink-0">Dosage:</span>
                            <span className="line-clamp-1">{product.dosage}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-10 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex border-b border-border mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold text-foreground mb-3">Mode of Action</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.modeOfAction}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold text-foreground mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold text-foreground mb-3">Target Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {product.targetCrops.map((c) => (
                    <span key={c} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
              {product.targetPests.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Target Pests / Diseases</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.targetPests.map((p) => (
                      <span key={p} className="bg-secondary/10 text-secondary text-xs font-medium px-2.5 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "safety" && (
            <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <h3 className="font-heading font-semibold text-foreground">Safety Precautions</h3>
                </div>
                <ul className="space-y-3">
                  {product.safetyPrecautions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <PesticideLoadIndicator category={product.category as ChemCategory} />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="max-w-3xl space-y-4">
              <h3 className="font-heading font-semibold text-foreground">Material Safety Data Sheets (MSDS)</h3>
              {msdsDocs.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No MSDS documents have been uploaded for this product yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {msdsDocs.map((d) => (
                    <a
                      key={d.id}
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-elevated transition-all"
                    >
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{product.name} MSDS</p>
                        <p className="text-xs text-muted-foreground">
                          {d.language.toUpperCase()}{d.version ? ` · v${d.version}` : ""}{d.file_size_kb ? ` · ${d.file_size_kb} KB` : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto bg-card rounded-xl border border-border p-8 shadow-card">
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">Inquire About {product.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">Have questions? Send us an inquiry and our team will respond promptly.</p>
            <form onSubmit={handleInquiry} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                  <Input value={inquiryForm.name} onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })} required /></div>
                <div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })} required /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile number</label>
                <Input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\-\s]{7,20}"
                  placeholder="+91 ..."
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  required
                />
              </div>
              <div><label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea rows={4} value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} required /></div>
              <Button type="submit" className="gap-2" disabled={submittingInquiry}>
                {submittingInquiry ? "Sending..." : "Send Inquiry"} <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/products/${rp.id}`}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-elevated transition-all group"
                >
                  <div className="h-32 bg-muted flex items-center justify-center p-4">
                    <img src={rp.image} alt={rp.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary font-medium">{rp.categoryLabel}</span>
                    <h3 className="font-heading text-sm font-semibold text-foreground mt-1">{rp.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rp.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
