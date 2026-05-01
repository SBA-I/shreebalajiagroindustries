import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout } from "lucide-react";

const FarmerPortal = () => (
  <Layout>
    <section className="bg-primary py-12">
      <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
        <Sprout className="h-7 w-7 text-primary-foreground" />
        <h1 className="font-heading text-3xl font-bold text-primary-foreground">Farmer Dashboard</h1>
      </div>
    </section>
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Welcome!</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Personalised crop advisory, your spray history, and order tracking will appear here.</p>
            <p>For now, explore products, ask Balaji AI, and use the Profit Simulator from the main menu.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  </Layout>
);

export default FarmerPortal;