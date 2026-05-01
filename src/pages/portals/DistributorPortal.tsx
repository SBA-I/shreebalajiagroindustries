import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

const DistributorPortal = () => (
  <Layout>
    <section className="bg-primary py-12">
      <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
        <Store className="h-7 w-7 text-primary-foreground" />
        <h1 className="font-heading text-3xl font-bold text-primary-foreground">Distributor Portal</h1>
      </div>
    </section>
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            B2B cart, inventory, invoices, and analytics will appear here.
          </CardContent>
        </Card>
      </div>
    </section>
  </Layout>
);

export default DistributorPortal;