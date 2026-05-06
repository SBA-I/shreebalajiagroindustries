import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AttendanceCard from "@/components/field-officer/AttendanceCard";
import VisitLogManager from "@/components/field-officer/VisitLogManager";
import DealerAuditManager from "@/components/field-officer/DealerAuditManager";
import FarmerLeadManager from "@/components/field-officer/FarmerLeadManager";
import InquiryForm from "@/components/portal/InquiryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarketingLibrary from "@/components/dealer/MarketingLibrary";

const FieldOfficerPortal = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
          <MapPin className="h-7 w-7 text-primary-foreground" />
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">Field Officer Portal</h1>
            <p className="text-primary-foreground/80 text-sm">Activity & Agronomy productivity hub</p>
          </div>
        </div>
      </section>
      <section className="py-6">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-4">
          <AttendanceCard userId={user.id} />
          <Tabs defaultValue="visits">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="audits">Dealer Audits</TabsTrigger>
              <TabsTrigger value="leads">Farmer Leads</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="inquiry">Inquiry</TabsTrigger>
            </TabsList>
            <TabsContent value="visits" className="mt-4"><VisitLogManager userId={user.id} /></TabsContent>
            <TabsContent value="audits" className="mt-4"><DealerAuditManager userId={user.id} /></TabsContent>
            <TabsContent value="leads" className="mt-4"><FarmerLeadManager userId={user.id} /></TabsContent>
            <TabsContent value="assets" className="mt-4">
              <MarketingLibrary
                audiences={["field_officers", "public"]}
                title="Field Officer Assets"
                subtitle="Marketing kits, brochures, and demo videos shared by Admin for field activities."
              />
            </TabsContent>
            <TabsContent value="inquiry" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Send an Inquiry</CardTitle></CardHeader>
                <CardContent><InquiryForm role="field_officer" /></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default FieldOfficerPortal;