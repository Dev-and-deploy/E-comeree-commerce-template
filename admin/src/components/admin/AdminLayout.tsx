import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/store";
import AdminSidebar from "./AdminSidebar";
import { useEffect } from "react";

const AdminLayout = () => {
  const { mode } = useAppSelector((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
