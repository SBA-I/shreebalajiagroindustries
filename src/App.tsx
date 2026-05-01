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
import AskAI from "./pages/AskAI";
import YieldSimulator from "./pages/YieldSimulator";
import AiChatWidget from "./components/ai/AiChatWidget";
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
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/yield-simulator" element={<YieldSimulator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AiChatWidget />
        </BrowserRouter>
      </ComparisonProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
