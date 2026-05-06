"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "../../store/slices/cartSlice.js";
import { api } from "../../lib/api.js";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", address: "", city: "", country: "US", zip: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: { name: form.name, email: form.email, address: form.address, city: form.city, country: form.country, zip: form.zip },
      });
      router.push(`/checkout/success?order=${data.data.order.orderNumber}`);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <div className="container mx-auto px-4 py-16 text-center"><p>Your cart is empty.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-semibold text-lg">Shipping Information</h2>
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "address", label: "Address", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "zip", label: "ZIP Code", type: "text" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              <input
                type={f.type}
                required
                className="w-full border rounded px-3 py-2 text-sm"
                value={form[f.name]}
                onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-center">
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>

        <div>
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
