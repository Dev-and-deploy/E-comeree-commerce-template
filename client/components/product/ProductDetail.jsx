"use client";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ShoppingCart, Heart } from "lucide-react";
import { useSettings } from "../../providers/SettingsProvider.jsx";

export default function ProductDetail({ product }) {
  const dispatch = useDispatch();
  const { currencySymbol } = useSettings();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images?.[activeImg] ? (
              <Image src={product.images[activeImg]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 rounded overflow-hidden border-2 ${activeImg === i ? "border-accent" : "border-transparent"}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <nav className="text-sm text-gray-500">
            <span>Home</span> / <span>Products</span> / <span className="text-primary">{product.name}</span>
          </nav>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">{currencySymbol}{product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-gray-400 line-through">{currencySymbol}{product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Stock:</span>
            <span className={product.stock > 0 ? "text-green-600 text-sm" : "text-red-500 text-sm"}>
              {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
            </span>
          </div>

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <button className="px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="px-4 py-1 border-x">{qty}</span>
                  <button className="px-3 py-1" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => dispatch(addToCart({ product, quantity: qty }))}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button className="p-3 border rounded hover:bg-gray-50 transition-colors" aria-label="Wishlist">
                  <Heart size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
