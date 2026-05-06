import Link from "next/link";
import ProductCard from "../../components/product/ProductCard.jsx";

export default function ModernHome({ theme, featuredProducts = [] }) {
  return (
    <div className="modern-template">
      {/* Split Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        <div className="flex items-center px-12 py-20" style={{ backgroundColor: "var(--color-primary)" }}>
          <div className="text-white">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {theme?.storeName || "Modern Store"}
            </h1>
            <p className="text-lg opacity-70 mb-8">Bold. Fresh. Yours.</p>
            <Link href="/products" className="inline-block px-8 py-3 font-semibold text-sm transition-opacity hover:opacity-80 rounded"
              style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}>
              Shop the Drop
            </Link>
          </div>
        </div>
        <div className="bg-gray-100 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-48 h-48 rounded-full mx-auto mb-6"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))` }} />
            <p className="text-gray-500 text-sm">Explore our newest drops</p>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <Link href="/products" className="text-sm underline">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 text-center" style={{ backgroundColor: "var(--color-accent)" }}>
        <h2 className="text-3xl font-bold text-white mb-4">Sale — Up to 50% Off</h2>
        <p className="text-white/80 mb-8">Limited time. Grab your favourites now.</p>
        <Link href="/products" className="inline-block px-10 py-3 bg-white font-semibold text-sm rounded hover:bg-gray-100 transition-colors"
          style={{ color: "var(--color-accent)" }}>
          Shop Sale
        </Link>
      </section>
    </div>
  );
}
