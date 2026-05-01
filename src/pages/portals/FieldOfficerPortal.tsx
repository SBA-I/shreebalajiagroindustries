import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const FieldOfficerPortal = () => (
  <Layout>
    <section className="bg-primary py-12">
      <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
        <MapPin className="h-7 w-7 text-primary-foreground" />
        <h1 className="font-heading text-3xl font-bold text-primary-foreground">Field Officer Portal</h1>
      </div>
    </section>
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            GPS tracking, daily reports, and target dashboards will appear here.
          </CardContent>
        </Card>
      </div>
    </section>
  </Layout>
);

export default FieldOfficerPortal;