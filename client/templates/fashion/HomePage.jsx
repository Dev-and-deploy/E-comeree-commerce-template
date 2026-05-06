import Link from "next/link";
import Image from "next/image";
import ProductCard from "../../components/product/ProductCard.jsx";

export default function FashionHome({ theme, featuredProducts = [] }) {
  return (
    <div className="fashion-template">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <p className="tracking-[0.3em] text-sm uppercase mb-4" style={{ color: "var(--color-accent)" }}>
            New Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {theme?.storeName || "Fashion Forward"}
          </h1>
          <p className="text-xl opacity-80 mb-10">Discover styles that define you</p>
          <Link href="/products" className="inline-block px-10 py-4 text-sm tracking-widest uppercase font-semibold transition-all"
            style={{ backgroundColor: "var(--color-accent)", color: "#fff", borderRadius: "var(--border-radius)" }}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Featured Collection</h2>
            <p className="text-gray-500">Handpicked favourites just for you</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn-primary inline-block">View All Products</Link>
          </div>
        </section>
      )}

      {/* Banner Strip */}
      <section className="py-8" style={{ backgroundColor: "var(--color-accent)" }}>
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 text-white text-sm font-medium">
          {["Free Shipping Over $50", "Easy Returns", "Secure Checkout", "24/7 Support"].map((t) => (
            <span key={t} className="flex items-center gap-2">✓ {t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
