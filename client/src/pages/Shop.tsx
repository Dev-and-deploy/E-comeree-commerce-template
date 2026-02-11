import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import StoreLayout from '@/components/layout/StoreLayout';
import ProductCard from '@/components/store/ProductCard';
import { motion } from 'framer-motion';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [sortBy, setSortBy] = useState('newest');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.getCategories();
      return response.data || [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categorySlug, sortBy],
    queryFn: async () => {
      const params: any = { sort: sortBy };
      
      if (categorySlug) {
        params.category = categorySlug;
      }
      
      const response = await apiClient.getProducts(params);
      return response.data || [];
    },
    enabled: categorySlug ? !!categories : true,
  });

  const activeCategory = categories?.find(c => c.slug === categorySlug);

  return (
    <StoreLayout>
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="luxury-label text-[10px] tracking-[0.4em] text-muted-foreground mb-3">
              {activeCategory ? 'Collection' : 'All Collections'}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight">
              {activeCategory?.name || 'Shop'}
            </h1>
            {activeCategory?.description && (
              <p className="font-body text-sm text-muted-foreground mt-4 max-w-md mx-auto tracking-wide">
                {activeCategory.description}
              </p>
            )}
          </motion.div>

          {/* Filters bar */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-10">
            <div className="flex gap-6">
              <a
                href="/shop"
                className={`luxury-label text-[10px] transition-opacity ${!categorySlug ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
              >
                All
              </a>
              {(categories || []).map(cat => (
                <a
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`luxury-label text-[10px] transition-opacity ${categorySlug === cat.slug ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="luxury-label text-[10px] bg-transparent border-0 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-4" />
                  <div className="h-3 bg-secondary w-2/3 mb-2" />
                  <div className="h-3 bg-secondary w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(products || []).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    compareAtPrice={product.compare_at_price ? Number(product.compare_at_price) : null}
                    images={product.images || []}
                    brand={product.brand}
                    slug={product.slug}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {products && products.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground font-body text-sm py-20 tracking-wide">
              No products found in this collection.
            </p>
          )}
        </div>
      </section>
    </StoreLayout>
  );
};

export default Shop;
