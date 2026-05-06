"use client";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, clearCart } from "../../store/slices/cartSlice.js";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-white">
              <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden shrink-0">
                {item.images?.[0] ? (
                  <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-accent font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center border rounded text-sm">
                  <button className="px-2 py-1" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>−</button>
                  <span className="px-3 py-1 border-x">{item.quantity}</span>
                  <button className="px-2 py-1" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
                </div>
                <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-700">Clear cart</button>
        </div>

        <div className="p-6 border rounded-lg bg-white h-fit">
          <h2 className="font-bold text-xl mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
