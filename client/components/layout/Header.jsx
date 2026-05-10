"use client";
import Link from "next/link";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCartCount } from "../../store/slices/cartSlice.js";

export default function Header({ theme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-xl" style={{ color: "var(--color-primary)" }}>
          {theme?.storeName || "MyStore"}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <Link href="/products" className="hover:text-accent transition-colors">Shop</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/products?search=" aria-label="Search" className="p-2 hover:text-accent transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/auth/login" aria-label="Account" className="p-2 hover:text-accent transition-colors">
            <User size={20} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative p-2 hover:text-accent transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 text-sm">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
        </div>
      )}
    </header>
  );
}
