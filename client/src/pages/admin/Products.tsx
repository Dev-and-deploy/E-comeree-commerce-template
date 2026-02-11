import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await apiClient.getAdminProducts();
      return response.data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.getAdminCategories();
      return response.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteProduct(id);
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      let response;
      if (product.id) {
        response = await apiClient.updateProduct(product.id, product);
      } else {
        response = await apiClient.createProduct(product);
      }
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDialogOpen(false);
      setEditingProduct(null);
      toast.success('Product saved');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const product: any = {
      name: fd.get('name') as string,
      slug: (fd.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      compare_at_price: fd.get('compare_at_price') ? parseFloat(fd.get('compare_at_price') as string) : null,
      category_id: fd.get('category_id') || null,
      sku: fd.get('sku') as string,
      stock_quantity: parseInt(fd.get('stock_quantity') as string) || 0,
      brand: fd.get('brand') as string,
      material: fd.get('material') as string,
      is_featured: fd.get('is_featured') === 'on',
      is_active: fd.get('is_active') === 'on',
      sizes: (fd.get('sizes') as string).split(',').map(s => s.trim()).filter(Boolean),
      colors: (fd.get('colors') as string).split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editingProduct?.id) product.id = editingProduct.id;
    saveMutation.mutate(product);
  };

  const inputClass = "w-full bg-transparent border border-border px-3 py-2 font-body text-sm tracking-wide focus:outline-none focus:border-foreground transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-light tracking-tight">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button variant="luxury" size="sm"><Plus className="h-3 w-3 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-light">{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="luxury-label text-[9px] block mb-1">Name</label><input name="name" required defaultValue={editingProduct?.name} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Brand</label><input name="brand" defaultValue={editingProduct?.brand} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Price</label><input name="price" type="number" step="0.01" required defaultValue={editingProduct?.price} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Compare Price</label><input name="compare_at_price" type="number" step="0.01" defaultValue={editingProduct?.compare_at_price} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">SKU</label><input name="sku" defaultValue={editingProduct?.sku} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Stock</label><input name="stock_quantity" type="number" defaultValue={editingProduct?.stock_quantity || 0} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Category</label>
                  <select name="category_id" defaultValue={editingProduct?.category_id || ''} className={inputClass}>
                    <option value="">None</option>
                    {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="luxury-label text-[9px] block mb-1">Material</label><input name="material" defaultValue={editingProduct?.material} className={inputClass} /></div>
              </div>
              <div><label className="luxury-label text-[9px] block mb-1">Description</label><textarea name="description" rows={3} defaultValue={editingProduct?.description} className={inputClass + " resize-none"} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="luxury-label text-[9px] block mb-1">Sizes (comma-separated)</label><input name="sizes" defaultValue={editingProduct?.sizes?.join(', ')} className={inputClass} /></div>
                <div><label className="luxury-label text-[9px] block mb-1">Colors (comma-separated)</label><input name="colors" defaultValue={editingProduct?.colors?.join(', ')} className={inputClass} /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 font-body text-xs tracking-wide"><input type="checkbox" name="is_featured" defaultChecked={editingProduct?.is_featured} /> Featured</label>
                <label className="flex items-center gap-2 font-body text-xs tracking-wide"><input type="checkbox" name="is_active" defaultChecked={editingProduct?.is_active ?? true} /> Active</label>
              </div>
              <Button variant="luxury" type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-background border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 luxury-label text-[9px]">Product</th>
              <th className="text-left p-4 luxury-label text-[9px]">Category</th>
              <th className="text-left p-4 luxury-label text-[9px]">Price</th>
              <th className="text-left p-4 luxury-label text-[9px]">Stock</th>
              <th className="text-left p-4 luxury-label text-[9px]">Status</th>
              <th className="text-right p-4 luxury-label text-[9px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map(product => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <p className="font-body text-sm tracking-wide">{product.name}</p>
                  {product.brand && <p className="font-body text-[10px] text-muted-foreground">{product.brand}</p>}
                </td>
                <td className="p-4 font-body text-sm text-muted-foreground">{(product.categories as any)?.name || '—'}</td>
                <td className="p-4 font-body text-sm">${Number(product.price).toFixed(2)}</td>
                <td className="p-4 font-body text-sm">{product.stock_quantity}</td>
                <td className="p-4">
                  <span className={`luxury-label text-[9px] ${product.is_active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {product.is_active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditingProduct(product); setDialogOpen(true); }} className="p-2 hover:bg-secondary transition-colors inline-block">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => { if(confirm('Delete this product?')) deleteMutation.mutate(product.id); }} className="p-2 hover:bg-secondary transition-colors inline-block ml-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
