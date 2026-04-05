import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (requiredRole && user?.role !== requiredRole)
    return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
