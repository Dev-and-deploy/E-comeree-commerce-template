import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (settings?.id) {
        const { error } = await supabase.from('site_settings').update(formData).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings saved');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      site_name: fd.get('site_name'),
      hero_title: fd.get('hero_title'),
      hero_subtitle: fd.get('hero_subtitle'),
      seo_title: fd.get('seo_title'),
      seo_description: fd.get('seo_description'),
      template: fd.get('template'),
    });
  };

  const inputClass = "w-full bg-transparent border border-border px-3 py-2 font-body text-sm tracking-wide focus:outline-none focus:border-foreground transition-colors";

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight mb-8">Settings</h1>
      <p className="luxury-label text-[9px] text-muted-foreground mb-6">Super Admin Only</p>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        <div className="bg-background border border-border p-6 space-y-4">
          <h2 className="luxury-label text-[10px] mb-2">Branding</h2>
          <div><label className="luxury-label text-[9px] block mb-1">Site Name</label><input name="site_name" defaultValue={settings?.site_name || 'MAISON'} className={inputClass} /></div>
          <div><label className="luxury-label text-[9px] block mb-1">Hero Title</label><input name="hero_title" defaultValue={settings?.hero_title || ''} className={inputClass} /></div>
          <div><label className="luxury-label text-[9px] block mb-1">Hero Subtitle</label><input name="hero_subtitle" defaultValue={settings?.hero_subtitle || ''} className={inputClass} /></div>
        </div>

        <div className="bg-background border border-border p-6 space-y-4">
          <h2 className="luxury-label text-[10px] mb-2">SEO</h2>
          <div><label className="luxury-label text-[9px] block mb-1">Meta Title</label><input name="seo_title" defaultValue={settings?.seo_title || ''} className={inputClass} /></div>
          <div><label className="luxury-label text-[9px] block mb-1">Meta Description</label><textarea name="seo_description" rows={3} defaultValue={settings?.seo_description || ''} className={inputClass + " resize-none"} /></div>
        </div>

        <div className="bg-background border border-border p-6 space-y-4">
          <h2 className="luxury-label text-[10px] mb-2">Template</h2>
          <select name="template" defaultValue={settings?.template || 'minimal'} className={inputClass}>
            <option value="minimal">Minimal</option>
            <option value="premium">Premium Boutique</option>
            <option value="modern">Banner-Heavy Modern</option>
          </select>
        </div>

        <Button variant="luxury" size="lg" type="submit" className="w-full" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
};

export default AdminSettings;
