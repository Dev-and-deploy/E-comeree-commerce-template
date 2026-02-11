import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StoreLayout from '@/components/layout/StoreLayout';
import ProductCard from '@/components/store/ProductCard';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import heroImage1 from '@/assets/hero-1.jpg';
import heroImage2 from '@/assets/hero-2.jpg';
import categoryDresses from '@/assets/category-dresses.jpg';
import categoryOuterwear from '@/assets/category-outerwear.jpg';
import categoryAccessories from '@/assets/category-accessories.jpg';

const Index = () => {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await apiClient.getFeaturedProducts();
      return response.data || [];
    },
  });

  const { settings, isLoading: settingsLoading } = useSiteSettings();

  // Use default values if settings are not loaded yet or not available
  const heroTitle = settings?.hero_title || 'Curated Luxury';
  const heroSubtitle = settings?.hero_subtitle || 'Timeless pieces for the modern wardrobe';

  const categories = [
    { name: 'Dresses', slug: 'dresses', image: categoryDresses },
    { name: 'Outerwear', slug: 'outerwear', image: categoryOuterwear },
    { name: 'Accessories', slug: 'accessories', image: categoryAccessories },
  ];

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative h-[90vh] overflow-hidden">
        <img src={heroImage1} alt="Luxury fashion editorial" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center text-primary-foreground"
          >
            <p className="luxury-label text-[10px] tracking-[0.4em] mb-6 text-primary-foreground/80">New Collection</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6">
              {heroTitle}
            </h1>
            <p className="font-body text-sm tracking-[0.15em] font-light mb-10 text-primary-foreground/80">
              {heroSubtitle}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/shop">Explore Collection</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="luxury-label text-[10px] tracking-[0.4em] text-muted-foreground mb-3">Collections</p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">Shop by Category</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link to={`/shop?category=${cat.slug}`} className="group block relative aspect-[3/4] overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="luxury-label text-[10px] tracking-[0.3em] text-primary-foreground/70 mb-2">Explore</p>
                    <h3 className="font-display text-3xl text-primary-foreground font-light">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="luxury-label text-[10px] tracking-[0.4em] text-muted-foreground mb-3">Curated</p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight">Featured Pieces</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(featuredProducts || []).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
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

          {featuredProducts && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link to="/shop">View All</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={heroImage2} alt="Luxury accessories" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-md"
            >
              <p className="luxury-label text-[10px] tracking-[0.4em] text-primary-foreground/70 mb-4">Editorial</p>
              <h2 className="font-display text-4xl md:text-5xl text-primary-foreground font-light tracking-tight mb-6">
                The Art of Detail
              </h2>
              <p className="font-body text-sm text-primary-foreground/70 tracking-wide mb-8 leading-relaxed">
                Every piece tells a story of craftsmanship, quality materials, and timeless design.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/shop?category=accessories">Discover Accessories</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
};

export default Index;
