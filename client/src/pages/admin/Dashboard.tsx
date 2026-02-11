import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, orders, profiles] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = (orders.data || []).reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = (orders.data || []).filter(o => o.status === 'pending').length;

      return {
        totalProducts: products.count || 0,
        totalOrders: orders.data?.length || 0,
        pendingOrders,
        totalRevenue,
        totalCustomers: profiles.count || 0,
      };
    },
  });

  const cards = [
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign },
    { label: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingCart },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-background p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="luxury-label text-[9px] text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-light">{card.value}</p>
          </div>
        ))}
      </div>

      {stats?.pendingOrders ? (
        <div className="mt-6 bg-background p-6 border border-border">
          <p className="font-body text-sm tracking-wide">
            <span className="font-medium">{stats.pendingOrders}</span> pending order{stats.pendingOrders !== 1 ? 's' : ''} require attention.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
