import React from 'react';
import { Link } from 'react-router-dom';
import productPlaceholder from '@/assets/product-placeholder.jpg';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  brand?: string | null;
  slug: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, compareAtPrice, images, brand, slug }) => {
  const imageUrl = images?.[0] || productPlaceholder;

  return (
    <Link to={`/product/${slug}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden bg-secondary mb-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      {brand && (
        <p className="luxury-label text-[9px] text-muted-foreground mb-1">{brand}</p>
      )}
      <h3 className="font-display text-lg font-light tracking-wide mb-1">{name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-body text-sm tracking-wide">${price.toFixed(2)}</span>
        {compareAtPrice && compareAtPrice > price && (
          <span className="font-body text-xs text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
