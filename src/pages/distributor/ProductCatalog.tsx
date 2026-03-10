import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DistributorLayout from "@/components/distributor/DistributorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Plus, Minus, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { calculateGST, GST_RATE } from "@/lib/gst-utils";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
}

const ProductCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["catalog-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, unit, category, short_description, image_url, pack_sizes, is_new")
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["dist-profile-gst", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("gst_number, state").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const categories = ["all", ...Array.from(new Set(products?.map(p => p.category) ?? []))];

  const filtered = products?.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  }) ?? [];

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        return prev.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price ?? 0,
        unit: product.unit ?? "L",
        quantity: 1,
        category: product.category,
      }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.productId !== productId) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? c : { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const gst = calculateGST(subtotal, profile?.gst_number ?? "");

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return;

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id,
      order_number: "PENDING",
      total: gst.grandTotal,
    }).select().single();

    if (orderErr || !order) {
      toast.error(orderErr?.message ?? "Failed to create order");
      return;
    }

    const items = cart.map(c => ({
      order_id: order.id,
      product_id: c.productId,
      product_name: c.name,
      quantity: c.quantity,
      unit: c.unit,
      price: c.price,
    }));

    const { error } = await supabase.from("order_items").insert(items);
    if (error) {
      toast.error("Order created but items failed");
    } else {
      toast.success("Order placed successfully! 🎉");
      setCart([]);
      navigate("/distributor/orders");
    }
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <DistributorLayout title="Product Catalog" subtitle="Browse products and place bulk orders">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]"
            >
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(product => {
                const inCart = cart.find(c => c.productId === product.id);
                return (
                  <div key={product.id} className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-md transition-shadow">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-full h-32 object-contain rounded-lg mb-3 bg-muted" />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
                      {product.is_new && <Badge variant="secondary" className="text-[10px] shrink-0">NEW</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                    {product.short_description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.short_description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading font-bold text-foreground">₹{(product.price ?? 0).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">per {product.unit} + {GST_RATE}% GST</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(product.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-8 text-center text-foreground">{inCart.quantity}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(product.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(product)} className="gap-1.5">
                          <ShoppingCart className="h-3.5 w-3.5" /> Add
                        </Button>
                      )}
                    </div>
                    {product.pack_sizes && product.pack_sizes.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-2">Packs: {product.pack_sizes.join(", ")}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:w-80 xl:w-96 shrink-0">
          <div className="bg-card rounded-xl border border-border shadow-card sticky top-4">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Cart</h2>
                {cartCount > 0 && (
                  <Badge variant="default" className="ml-auto">{cartCount}</Badge>
                )}
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.productId)}>
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* GST Breakdown */}
                <div className="p-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{gst.subtotal.toLocaleString()}</span>
                  </div>
                  {gst.isIntraState ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CGST (9%)</span>
                        <span className="text-foreground">₹{gst.cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">SGST (9%)</span>
                        <span className="text-foreground">₹{gst.sgst.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IGST ({GST_RATE}%)</span>
                      <span className="text-foreground">₹{gst.igst.toLocaleString()}</span>
                    </div>
                  )}
                  {!profile?.gst_number && (
                    <p className="text-[10px] text-amber-600">⚠ Add GST number in Profile for accurate tax split</p>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-primary">₹{gst.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder}>
                    <ShoppingCart className="h-4 w-4" /> Place Order
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DistributorLayout>
  );
};

export default ProductCatalog;
