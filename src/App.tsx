import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComparisonProvider } from "@/hooks/use-product-comparison";
import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/i18n/I18nProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CompareProducts from "./pages/CompareProducts";
import Resources from "./pages/Resources";
import ArticleDetail from "./pages/ArticleDetail";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Contact from "./pages/Contact";
import AskAI from "./pages/AskAI";
import YieldSimulator from "./pages/YieldSimulator";
import HarvestTimer from "./pages/HarvestTimer";
import PestCalendar from "./pages/PestCalendar";
import SafetyHub from "./pages/SafetyHub";
import Sustainability from "./pages/Sustainability";
import Auth from "./pages/Auth";
import FarmerAuth from "./pages/auth/FarmerAuth";
import DistributorAuth from "./pages/auth/DistributorAuth";
import FieldOfficerAuth from "./pages/auth/FieldOfficerAuth";
import AdminAuth from "./pages/auth/AdminAuth";
import Dashboard from "./pages/Dashboard";
import AdminPortal from "./pages/portals/AdminPortal";
import DistributorPortal from "./pages/portals/DistributorPortal";
import FieldOfficerPortal from "./pages/portals/FieldOfficerPortal";
import FarmerPortal from "./pages/portals/FarmerPortal";
import FloatingActionHub from "./components/FloatingActionHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <I18nProvider>
        <AuthProvider>
          <ComparisonProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/compare" element={<CompareProducts />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/:slug" element={<ArticleDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/ask-ai" element={<AskAI />} />
              <Route path="/yield-simulator" element={<YieldSimulator />} />
              <Route path="/tools/harvest-timer" element={<HarvestTimer />} />
              <Route path="/tools/pest-calendar" element={<PestCalendar />} />
              <Route path="/safety" element={<SafetyHub />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/farmer" element={<FarmerAuth />} />
              <Route path="/auth/distributor" element={<DistributorAuth />} />
              <Route path="/auth/field-officer" element={<FieldOfficerAuth />} />
              <Route path="/auth/admin" element={<AdminAuth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPortal /></ProtectedRoute>} />
              <Route path="/distributor" element={<ProtectedRoute allowedRoles={["distributor", "admin"]}><DistributorPortal /></ProtectedRoute>} />
              <Route path="/field-officer" element={<ProtectedRoute allowedRoles={["field_officer", "admin"]}><FieldOfficerPortal /></ProtectedRoute>} />
              <Route path="/farmer" element={<ProtectedRoute allowedRoles={["farmer", "admin"]}><FarmerPortal /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingActionHub />
          </ComparisonProvider>
        </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
