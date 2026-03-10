import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComparisonProvider } from "@/hooks/use-product-comparison";
import { AuthProvider } from "@/contexts/AuthContext";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FarmerLogin from "./pages/FarmerLogin";
import DistributorDashboard from "./pages/distributor/DistributorDashboard";
import OrderManagement from "./pages/distributor/OrderManagement";
import InventoryManagement from "./pages/distributor/InventoryManagement";
import Messages from "./pages/distributor/Messages";
import Profile from "./pages/distributor/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FieldOfficerDashboard from "./pages/field-officer/FieldOfficerDashboard";
import DealerVisits from "./pages/field-officer/DealerVisits";
import FarmerMeetings from "./pages/field-officer/FarmerMeetings";
import FieldOfficerOrders from "./pages/field-officer/FieldOfficerOrders";
import SalesTargets from "./pages/field-officer/SalesTargets";
import FieldOfficerProfile from "./pages/field-officer/FieldOfficerProfile";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerProducts from "./pages/farmer/FarmerProducts";
import CropRecommendations from "./pages/farmer/CropRecommendations";
import DealerLocator from "./pages/farmer/DealerLocator";
import AskQuestion from "./pages/farmer/AskQuestion";
import ProductGuides from "./pages/farmer/ProductGuides";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ComparisonProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected distributor routes */}
              <Route path="/distributor" element={<ProtectedRoute requiredRole="distributor"><DistributorDashboard /></ProtectedRoute>} />
              <Route path="/distributor/orders" element={<ProtectedRoute requiredRole="distributor"><OrderManagement /></ProtectedRoute>} />
              <Route path="/distributor/inventory" element={<ProtectedRoute requiredRole="distributor"><InventoryManagement /></ProtectedRoute>} />
              <Route path="/distributor/messages" element={<ProtectedRoute requiredRole="distributor"><Messages /></ProtectedRoute>} />
              <Route path="/distributor/profile" element={<ProtectedRoute requiredRole="distributor"><Profile /></ProtectedRoute>} />

              {/* Admin route */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

              {/* Field Officer routes */}
              <Route path="/field-officer" element={<ProtectedRoute requiredRole="field_officer"><FieldOfficerDashboard /></ProtectedRoute>} />
              <Route path="/field-officer/visits" element={<ProtectedRoute requiredRole="field_officer"><DealerVisits /></ProtectedRoute>} />
              <Route path="/field-officer/meetings" element={<ProtectedRoute requiredRole="field_officer"><FarmerMeetings /></ProtectedRoute>} />
              <Route path="/field-officer/orders" element={<ProtectedRoute requiredRole="field_officer"><FieldOfficerOrders /></ProtectedRoute>} />
              <Route path="/field-officer/targets" element={<ProtectedRoute requiredRole="field_officer"><SalesTargets /></ProtectedRoute>} />
              <Route path="/field-officer/profile" element={<ProtectedRoute requiredRole="field_officer"><FieldOfficerProfile /></ProtectedRoute>} />

              {/* Farmer routes */}
              <Route path="/farmer" element={<ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/farmer/products" element={<ProtectedRoute requiredRole="farmer"><FarmerProducts /></ProtectedRoute>} />
              <Route path="/farmer/recommendations" element={<ProtectedRoute requiredRole="farmer"><CropRecommendations /></ProtectedRoute>} />
              <Route path="/farmer/dealers" element={<ProtectedRoute requiredRole="farmer"><DealerLocator /></ProtectedRoute>} />
              <Route path="/farmer/questions" element={<ProtectedRoute requiredRole="farmer"><AskQuestion /></ProtectedRoute>} />
              <Route path="/farmer/guides" element={<ProtectedRoute requiredRole="farmer"><ProductGuides /></ProtectedRoute>} />
              <Route path="/farmer/profile" element={<ProtectedRoute requiredRole="farmer"><FarmerProfile /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ComparisonProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
