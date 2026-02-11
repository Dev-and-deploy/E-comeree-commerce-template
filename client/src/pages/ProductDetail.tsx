import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import productPlaceholder from '@/assets/product-placeholder.jpg';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.getProductBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
            <div className="aspect-[3/4] bg-secondary" />
            <div className="space-y-4 py-8">
              <div className="h-3 bg-secondary w-1/4" />
              <div className="h-8 bg-secondary w-3/4" />
              <div className="h-4 bg-secondary w-1/3" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-3xl font-light mb-4">Product Not Found</h1>
          <Button variant="outline" asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images?.length ? product.images : [productPlaceholder];

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success('Added to bag');
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 luxury-label text-[10px] text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link></li>
            {product.categories && (
              <>
                <li>/</li>
                <li>
                  <Link to={`/shop?category=${(product.categories as any).slug}`} className="hover:text-foreground transition-colors">
                    {(product.categories as any).name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <div className="aspect-[3/4] overflow-hidden bg-secondary mb-4">
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 overflow-hidden border transition-opacity ${i === activeImage ? 'border-foreground opacity-100' : 'border-border opacity-50 hover:opacity-80'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="py-4"
          >
            {product.brand && (
              <p className="luxury-label text-[10px] text-muted-foreground mb-3">{product.brand}</p>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="font-body text-lg tracking-wide">${Number(product.price).toFixed(2)}</span>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                <span className="font-body text-sm text-muted-foreground line-through">
                  ${Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="luxury-divider !mx-0 mb-8" />

            {product.description && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed tracking-wide mb-8">
                {product.description}
              </p>
            )}

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="luxury-label text-[10px] mb-3">Size</p>
                <div className="flex gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center font-body text-xs border transition-all ${selectedSize === size ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="luxury-label text-[10px] mb-3">Color</p>
                <div className="flex gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 font-body text-xs border transition-all ${selectedColor === color ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <p className="luxury-label text-[10px] mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-secondary transition-colors">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-6 py-3 font-body text-sm border-x border-border">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-secondary transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <Button variant="luxury" size="xl" className="w-full" onClick={handleAddToCart}>
              Add to Bag
            </Button>

            {/* Details */}
            {product.material && (
              <div className="mt-10 border-t border-border pt-6">
                <p className="luxury-label text-[10px] mb-2">Material</p>
                <p className="font-body text-sm text-muted-foreground tracking-wide">{product.material}</p>
              </div>
            )}

            {product.sku && (
              <div className="mt-4">
                <p className="luxury-label text-[10px] mb-2">SKU</p>
                <p className="font-body text-sm text-muted-foreground tracking-wide">{product.sku}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductDetail;
