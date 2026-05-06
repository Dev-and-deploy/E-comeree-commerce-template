"use client";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <div className="card group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          {product.comparePrice && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
              SALE
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm mb-1 hover:text-accent truncate">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
            className="p-2 bg-primary text-secondary rounded-full hover:bg-accent transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
