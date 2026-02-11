import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminCustomers: React.FC = () => {
  const { data: profiles } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight mb-8">Customers</h1>
      <div className="bg-background border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 luxury-label text-[9px]">Name</th>
              <th className="text-left p-4 luxury-label text-[9px]">City</th>
              <th className="text-left p-4 luxury-label text-[9px]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(profiles || []).map(p => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4 font-body text-sm tracking-wide">{p.full_name || 'Unnamed'}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{p.city || '—'}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles?.length === 0 && <p className="p-8 text-center font-body text-sm text-muted-foreground">No customers yet.</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
