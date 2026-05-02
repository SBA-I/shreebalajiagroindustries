import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, FileText, Megaphone, Store, Truck, Bug, BookOpen, UserCheck, Receipt, Package, MessageSquare, Users, Boxes, UserCog, Newspaper } from "lucide-react";
import AdminMsdsManager from "@/components/admin/AdminMsdsManager";
import AdminMarketingManager from "@/components/admin/AdminMarketingManager";
import AdminDealersManager from "@/components/admin/AdminDealersManager";
import AdminDispatchManager from "@/components/admin/AdminDispatchManager";
import AdminPestCalendarManager from "@/components/admin/AdminPestCalendarManager";
import AdminResourcesManager from "@/components/admin/AdminArticlesManager";
import AdminVerificationQueue from "@/components/admin/AdminVerificationQueue";
import AdminInvoicesManager from "@/components/admin/AdminInvoicesManager";
import AdminProductsManager from "@/components/admin/AdminProductsManager";
import AdminContactInquiriesManager from "@/components/admin/AdminContactInquiriesManager";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import AdminDealerStockManager from "@/components/admin/AdminDealerStockManager";
import AdminFieldOfficersManager from "@/components/admin/AdminFieldOfficersManager";
import AdminNewsManager from "@/components/admin/AdminNewsManager";

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
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 h-auto gap-1 mb-6 bg-muted/40 p-1">
            <TabsTrigger value="verification" className="gap-1.5 justify-start"><UserCheck className="h-4 w-4 shrink-0" /> Verification</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 justify-start"><Users className="h-4 w-4 shrink-0" /> Users</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 justify-start"><Package className="h-4 w-4 shrink-0" /> Products</TabsTrigger>
            <TabsTrigger value="dealers" className="gap-1.5 justify-start"><Store className="h-4 w-4 shrink-0" /> Dealers</TabsTrigger>
            <TabsTrigger value="field-officers" className="gap-1.5 justify-start"><UserCog className="h-4 w-4 shrink-0" /> Field Officers</TabsTrigger>
            <TabsTrigger value="stock" className="gap-1.5 justify-start"><Boxes className="h-4 w-4 shrink-0" /> Dealer Stock</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5 justify-start"><Receipt className="h-4 w-4 shrink-0" /> Invoices</TabsTrigger>
            <TabsTrigger value="dispatch" className="gap-1.5 justify-start"><Truck className="h-4 w-4 shrink-0" /> Dispatch</TabsTrigger>
            <TabsTrigger value="msds" className="gap-1.5 justify-start"><FileText className="h-4 w-4 shrink-0" /> MSDS</TabsTrigger>
            <TabsTrigger value="marketing" className="gap-1.5 justify-start"><Megaphone className="h-4 w-4 shrink-0" /> Marketing</TabsTrigger>
            <TabsTrigger value="pest" className="gap-1.5 justify-start"><Bug className="h-4 w-4 shrink-0" /> Pest Calendar</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 justify-start"><BookOpen className="h-4 w-4 shrink-0" /> Resources & Sustainability</TabsTrigger>
            <TabsTrigger value="news" className="gap-1.5 justify-start"><Newspaper className="h-4 w-4 shrink-0" /> News</TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-1.5 justify-start"><MessageSquare className="h-4 w-4 shrink-0" /> Inquiries</TabsTrigger>
          </TabsList>
          <TabsContent value="verification"><AdminVerificationQueue /></TabsContent>
          <TabsContent value="users"><AdminUsersManager /></TabsContent>
          <TabsContent value="products"><AdminProductsManager /></TabsContent>
          <TabsContent value="dealers"><AdminDealersManager /></TabsContent>
          <TabsContent value="field-officers"><AdminFieldOfficersManager /></TabsContent>
          <TabsContent value="stock"><AdminDealerStockManager /></TabsContent>
          <TabsContent value="invoices"><AdminInvoicesManager /></TabsContent>
          <TabsContent value="dispatch"><AdminDispatchManager /></TabsContent>
          <TabsContent value="msds"><AdminMsdsManager /></TabsContent>
          <TabsContent value="marketing"><AdminMarketingManager /></TabsContent>
          <TabsContent value="pest"><AdminPestCalendarManager /></TabsContent>
          <TabsContent value="resources"><AdminResourcesManager /></TabsContent>
          <TabsContent value="news"><AdminNewsManager /></TabsContent>
          <TabsContent value="inquiries"><AdminContactInquiriesManager /></TabsContent>
        </Tabs>
      </div>
    </section>
  </Layout>
);

export default AdminPortal;