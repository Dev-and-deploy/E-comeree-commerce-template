import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await apiClient.getMyProfile();
      return response.data;
    },
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const response = await apiClient.getUserOrders();
      return response.data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-display text-4xl font-light tracking-tight">My Account</h1>
          <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Profile */}
          <div>
            <h2 className="luxury-label text-[11px] mb-6">Profile</h2>
            <div className="space-y-3 font-body text-sm tracking-wide">
              <p>{profile?.full_name || 'No name set'}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="luxury-label text-[11px] mb-6">Order History</h2>
            {orders && orders.length > 0 ? (
              <div className="space-y-0">
                {orders.map(order => (
                  <div key={order.id} className="border-b border-border py-6 flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm tracking-wide">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-sm tracking-wide">${Number(order.total).toFixed(2)}</p>
                      <p className="luxury-label text-[9px] text-muted-foreground mt-1">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground tracking-wide">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default Account;
