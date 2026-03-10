import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import FieldOfficerLayout from "@/components/field-officer/FieldOfficerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const FieldOfficerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <FieldOfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Order Booking</h1>
          <p className="text-muted-foreground">View and track orders booked during dealer visits</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p>No orders booked yet. Orders placed during dealer visits will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{o.order_number}</CardTitle>
                    <Badge className={statusColors[o.status] || "bg-muted"} variant="secondary">
                      {o.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</span>
                    <span className="font-semibold">₹{o.total.toLocaleString()}</span>
                  </div>
                  {o.notes && <p className="text-sm text-muted-foreground mt-1">{o.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FieldOfficerLayout>
  );
};

export default FieldOfficerOrders;
