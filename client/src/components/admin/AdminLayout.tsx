import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, Settings, LogOut, ChevronLeft } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || (userRole !== 'admin' && userRole !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-light mb-4">Access Denied</h1>
          <Link to="/" className="luxury-label text-[10px] text-muted-foreground hover:text-foreground">Return to Store</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    ...(userRole === 'super_admin' ? [{ to: '/admin/settings', icon: Settings, label: 'Settings' }] : []),
  ];

  const isActive = (path: string, exact?: boolean) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col fixed h-full">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground transition-colors luxury-label text-[9px]">
            <ChevronLeft className="h-3 w-3" /> Back to Store
          </Link>
          <h1 className="font-display text-xl tracking-[0.15em] font-light mt-4">MAISON</h1>
          <p className="luxury-label text-[9px] text-primary-foreground/40 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6 px-3">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 mb-1 transition-all font-body text-xs tracking-wide ${
                isActive(item.to, item.exact) ? 'bg-primary-foreground/10 text-primary-foreground' : 'text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-foreground/10">
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-primary-foreground/50 hover:text-primary-foreground transition-colors font-body text-xs tracking-wide"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 bg-secondary min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
