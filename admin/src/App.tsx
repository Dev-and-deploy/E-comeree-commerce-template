import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setAuthInitialized } from "@/store/slices/authSlice";
import { useMeQuery } from "@/store/api/authApi";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Categories from "@/pages/admin/Categories";
import Orders from "@/pages/admin/Orders";
import Marketing from "@/pages/admin/Marketing";
import Discounts from "@/pages/admin/Discounts";
import Blogs from "@/pages/admin/Blogs";
import Settings from "@/pages/admin/Settings";
import Users from "@/pages/admin/Users";
import Admins from "@/pages/admin/Admins";
import ThemeCustomizer from "@/pages/admin/ThemeCustomizer";
import Templates from "@/pages/admin/Templates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ─── Auth Initializer ─────────────────────────────────────────────────────────
// Calls GET /auth/me once on mount. If the accessToken cookie is valid the
// server returns the user and we mark the session as authenticated. If not (the
// cookie is missing / expired) we mark the session as unauthenticated so
// ProtectedRoute can redirect to /admin/login without flashing blank content.

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector((s) => s.auth.authInitialized);

  const { data, error, isLoading } = useMeQuery(undefined, {
    // Skip if already initialized to avoid unnecessary network calls on re-renders
    skip: authInitialized,
  });

  useEffect(() => {
    if (isLoading) return;
    if (data?.data) {
      dispatch(setAuthInitialized({ user: data.data }));
    } else if (error) {
      // 401 or network failure — session is invalid
      dispatch(setAuthInitialized({ user: null }));
    }
  }, [data, error, isLoading, dispatch]);

  return null;
}

// ─── App ──────────────────────────────────────────────────────────────────────

const AppRoutes = () => (
  <BrowserRouter>
    <AuthInitializer />
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="theme" element={<ThemeCustomizer />} />
        <Route path="templates" element={<Templates />} />
        <Route
          path="admins"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Admins />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
