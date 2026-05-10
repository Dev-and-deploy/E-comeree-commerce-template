import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/store";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/store/slices/authSlice";
import { hasPermission, type Permission } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Exact role required (legacy — prefer `requiredPermission`) */
  requiredRole?: UserRole | "super_admin";
  /** Permission key required — uses the role-permission map */
  requiredPermission?: Permission;
}

const ProtectedRoute = ({ children, requiredRole, requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, authInitialized, user } = useAppSelector((s) => s.auth);

  // Wait for the /auth/me check to resolve before deciding what to render.
  // This prevents a flash redirect to /login while the cookie is being verified.
  if (!authInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  if (requiredRole) {
    const userRole = user?.role?.toLowerCase().replace(/_/g, "") ?? "";
    const required = requiredRole.toLowerCase().replace(/_/g, "");
    if (userRole !== required) return <Navigate to="/admin" replace />;
  }

  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
