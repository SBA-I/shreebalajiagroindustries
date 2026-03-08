import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComparisonProvider } from "@/hooks/use-product-comparison";
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
import DistributorDashboard from "./pages/distributor/DistributorDashboard";
import OrderManagement from "./pages/distributor/OrderManagement";
import InventoryManagement from "./pages/distributor/InventoryManagement";
import Messages from "./pages/distributor/Messages";
import Profile from "./pages/distributor/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ComparisonProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* Distributor Portal */}
            <Route path="/distributor" element={<DistributorDashboard />} />
            <Route path="/distributor/orders" element={<OrderManagement />} />
            <Route path="/distributor/inventory" element={<InventoryManagement />} />
            <Route path="/distributor/messages" element={<Messages />} />
            <Route path="/distributor/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ComparisonProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
