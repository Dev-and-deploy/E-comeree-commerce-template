import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { toast } from 'sonner';

const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.getAdminOrders();
      return response.data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.updateOrderStatus(id, { status });
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
  });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight mb-8">Orders</h1>
      <div className="bg-background border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 luxury-label text-[9px]">Order</th>
              <th className="text-left p-4 luxury-label text-[9px]">Date</th>
              <th className="text-left p-4 luxury-label text-[9px]">Total</th>
              <th className="text-left p-4 luxury-label text-[9px]">Payment</th>
              <th className="text-left p-4 luxury-label text-[9px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(order => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="p-4 font-body text-sm tracking-wide">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-body text-sm">${Number(order.total).toFixed(2)}</td>
                <td className="p-4 luxury-label text-[9px] text-muted-foreground">{order.payment_status}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                    className="bg-transparent border border-border px-2 py-1 font-body text-xs tracking-wide focus:outline-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders?.length === 0 && (
          <p className="p-8 text-center font-body text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
