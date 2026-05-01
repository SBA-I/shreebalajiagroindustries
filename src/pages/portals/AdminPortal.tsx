import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const AdminPortal = () => (
  <Layout>
    <section className="bg-primary py-12">
      <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary-foreground" />
        <h1 className="font-heading text-3xl font-bold text-primary-foreground">Admin Portal</h1>
      </div>
    </section>
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <Card>
          <CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The full admin dashboard (manage products, users, contact inquiries, and field officers) is under development.
            For now, you can manage data via the backend.
          </CardContent>
        </Card>
      </div>
    </section>
  </Layout>
);

export default AdminPortal;