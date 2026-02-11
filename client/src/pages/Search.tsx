import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoreLayout from '@/components/layout/StoreLayout';
import ProductCard from '@/components/store/ProductCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const { data: results } = useQuery({
    queryKey: ['search', searchParams.get('q')],
    queryFn: async () => {
      const q = searchParams.get('q');
      if (!q) return [];
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`);
      return data || [];
    },
    enabled: !!searchParams.get('q'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-16">
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
          <div className="flex items-center border-b border-foreground">
            <SearchIcon className="h-5 w-5 mr-3" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent font-display text-2xl font-light py-4 focus:outline-none tracking-wide placeholder:text-muted-foreground/30"
              autoFocus
            />
          </div>
        </form>

        {results && results.length > 0 && (
          <>
            <p className="luxury-label text-[10px] text-muted-foreground mb-8">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  compareAtPrice={product.compare_at_price ? Number(product.compare_at_price) : null}
                  images={product.images || []}
                  brand={product.brand}
                  slug={product.slug}
                />
              ))}
            </div>
          </>
        )}

        {searchParams.get('q') && results && results.length === 0 && (
          <p className="text-center font-body text-sm text-muted-foreground tracking-wide">No results found for "{searchParams.get('q')}"</p>
        )}
      </div>
    </StoreLayout>
  );
};

export default SearchPage;
