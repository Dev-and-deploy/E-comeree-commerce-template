import Link from "next/link";
import ProductCard from "../../components/product/ProductCard.jsx";

export default function ElectronicsHome({ theme, featuredProducts = [] }) {
  return (
    <div className="electronics-template">
      {/* Hero */}
      <section className="bg-gray-950 text-white py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
                Next-Gen Technology
              </span>
              <h1 className="text-5xl font-bold mt-4 mb-6 leading-tight">
                {theme?.storeName || "TechStore"}
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                The latest gadgets, best prices, delivered fast.
              </p>
              <div className="flex gap-4">
                <Link href="/products" className="px-8 py-3 font-semibold text-sm rounded transition-colors"
                  style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}>
                  Shop Now
                </Link>
                <Link href="/products?featured=true"
                  className="px-8 py-3 font-semibold text-sm rounded border border-white/20 hover:bg-white/10 transition-colors">
                  Top Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-30 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Specs Strip */}
      <div className="bg-gray-900 text-gray-300 py-4">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 text-xs font-medium">
          {["Official Warranty", "Fast Delivery", "Secure Payments", "Expert Support"].map((t) => (
            <span key={t}>⚡ {t}</span>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featuredProducts.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/products" className="btn-primary inline-block">Browse All</Link>
          </div>
        </section>
      )}
    </div>
  );
}
