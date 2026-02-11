import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.getAdminCategories();
      return response.data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const categoryData = { name, description };
      const response = await apiClient.createCategory(categoryData);
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setName(''); setDescription('');
      toast.success('Category added');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteCategory(id);
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
  });

  const inputClass = "w-full bg-transparent border border-border px-3 py-2 font-body text-sm tracking-wide focus:outline-none focus:border-foreground transition-colors";

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight mb-8">Categories</h1>

      <div className="bg-background border border-border p-6 mb-8">
        <h2 className="luxury-label text-[10px] mb-4">Add Category</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="luxury-label text-[9px] block mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="luxury-label text-[9px] block mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
          </div>
          <Button variant="luxury" size="sm" onClick={() => addMutation.mutate()} disabled={!name}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="bg-background border border-border">
        {(categories || []).map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
            <div>
              <p className="font-body text-sm tracking-wide">{cat.name}</p>
              {cat.description && <p className="font-body text-[10px] text-muted-foreground">{cat.description}</p>}
            </div>
            <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(cat.id); }} className="p-2 hover:bg-secondary">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {categories?.length === 0 && <p className="p-8 text-center font-body text-sm text-muted-foreground">No categories yet.</p>}
      </div>
    </div>
  );
};

export default AdminCategories;
