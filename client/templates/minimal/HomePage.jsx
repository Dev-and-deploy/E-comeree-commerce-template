import Link from "next/link";
import ProductCard from "../../components/product/ProductCard.jsx";

export default function MinimalHome({ theme, featuredProducts = [] }) {
  return (
    <div className="minimal-template">
      {/* Hero — ultra-clean */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6">
          {theme?.storeName || "Store"}
        </h1>
        <p className="text-gray-400 max-w-sm text-lg mb-10">
          Less is more. Shop curated essentials.
        </p>
        <Link href="/products"
          className="text-sm tracking-widest uppercase border-b-2 pb-1 hover:opacity-60 transition-opacity"
          style={{ borderColor: "var(--color-primary)" }}>
          Explore Collection
        </Link>
      </section>

      <hr className="border-gray-100" />

      {/* Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="text-sm underline">View everything</Link>
          </div>
        </section>
      )}
    </div>
  );
}
