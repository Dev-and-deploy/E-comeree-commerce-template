import Link from "next/link";

export default function Footer({ theme }) {
  return (
    <footer className="bg-primary text-secondary mt-auto py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">{theme?.storeName || "MyStore"}</h3>
          <p className="text-sm opacity-75">Premium quality products delivered to your door.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-75">
            <li><Link href="/products" className="hover:opacity-100">Shop</Link></li>
            <li><Link href="/auth/login" className="hover:opacity-100">My Account</Link></li>
            <li><Link href="/cart" className="hover:opacity-100">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm opacity-75">
            <li><span>Contact Us</span></li>
            <li><span>Returns & Exchanges</span></li>
            <li><span>Shipping Policy</span></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-white/20 text-center text-sm opacity-60">
        © {new Date().getFullYear()} {theme?.storeName || "MyStore"}. All rights reserved.
      </div>
    </footer>
  );
}
