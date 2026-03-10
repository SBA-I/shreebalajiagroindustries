import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role - treat "dealer" and "distributor" as equivalent for distributor routes
  if (requiredRole) {
    const hasAccess = requiredRole === "distributor"
      ? (userRole === "distributor" || userRole === "dealer")
      : userRole === requiredRole;

    if (!hasAccess) {
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "distributor" || userRole === "dealer") return <Navigate to="/distributor" replace />;
      if (userRole === "field_officer") return <Navigate to="/field-officer" replace />;
      if (userRole === "farmer") return <Navigate to="/farmer" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
