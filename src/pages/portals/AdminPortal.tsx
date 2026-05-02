import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, FileText, Megaphone, Store, Truck, Bug, Leaf, UserCheck, Receipt } from "lucide-react";
import AdminMsdsManager from "@/components/admin/AdminMsdsManager";
import AdminMarketingManager from "@/components/admin/AdminMarketingManager";
import AdminDealersManager from "@/components/admin/AdminDealersManager";
import AdminDispatchManager from "@/components/admin/AdminDispatchManager";
import AdminPestCalendarManager from "@/components/admin/AdminPestCalendarManager";
import AdminArticlesManager from "@/components/admin/AdminArticlesManager";
import AdminVerificationQueue from "@/components/admin/AdminVerificationQueue";
import AdminInvoicesManager from "@/components/admin/AdminInvoicesManager";

const AdminPortal = () => (
  <Layout>
    <section className="bg-primary py-10">
      <div className="container mx-auto px-4 lg:px-8 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary-foreground" />
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">Admin Portal</h1>
          <p className="text-primary-foreground/80 text-sm">Manage content for every section of the website.</p>
        </div>
      </div>
    </section>

    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <Tabs defaultValue="verification">
          <TabsList className="flex-wrap h-auto mb-6">
            <TabsTrigger value="verification" className="gap-1.5"><UserCheck className="h-4 w-4" /> Verification</TabsTrigger>
            <TabsTrigger value="msds" className="gap-1.5"><FileText className="h-4 w-4" /> MSDS</TabsTrigger>
            <TabsTrigger value="marketing" className="gap-1.5"><Megaphone className="h-4 w-4" /> Marketing</TabsTrigger>
            <TabsTrigger value="dealers" className="gap-1.5"><Store className="h-4 w-4" /> Dealers</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-4 w-4" /> Invoices</TabsTrigger>
            <TabsTrigger value="dispatch" className="gap-1.5"><Truck className="h-4 w-4" /> Dispatch</TabsTrigger>
            <TabsTrigger value="pest" className="gap-1.5"><Bug className="h-4 w-4" /> Pest Calendar</TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5"><Leaf className="h-4 w-4" /> Articles</TabsTrigger>
          </TabsList>
          <TabsContent value="verification"><AdminVerificationQueue /></TabsContent>
          <TabsContent value="msds"><AdminMsdsManager /></TabsContent>
          <TabsContent value="marketing"><AdminMarketingManager /></TabsContent>
          <TabsContent value="dealers"><AdminDealersManager /></TabsContent>
          <TabsContent value="invoices"><AdminInvoicesManager /></TabsContent>
          <TabsContent value="dispatch"><AdminDispatchManager /></TabsContent>
          <TabsContent value="pest"><AdminPestCalendarManager /></TabsContent>
          <TabsContent value="articles"><AdminArticlesManager /></TabsContent>
        </Tabs>
      </div>
    </section>
  </Layout>
);

export default AdminPortal;