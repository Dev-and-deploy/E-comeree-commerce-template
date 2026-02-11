import React from 'react';
import { Link } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X } from 'lucide-react';
import productPlaceholder from '@/assets/product-placeholder.jpg';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-4xl font-light mb-4">Your Bag is Empty</h1>
          <p className="font-body text-sm text-muted-foreground tracking-wide mb-8">
            Discover our curated collections.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const shipping = totalPrice >= 500 ? 0 : 25;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-light tracking-tight mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0">
            {items.map(item => (
              <div key={item.id} className="flex gap-6 py-8 border-b border-border">
                <div className="w-24 h-32 bg-secondary flex-shrink-0">
                  <img src={item.image || productPlaceholder} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-display text-lg font-light">{item.name}</h3>
                      {item.size && <p className="luxury-label text-[9px] text-muted-foreground mt-1">Size: {item.size}</p>}
                      {item.color && <p className="luxury-label text-[9px] text-muted-foreground">Color: {item.color}</p>}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="hover:opacity-60 transition-opacity h-fit">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-4 py-2 font-body text-xs border-x border-border">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-body text-sm tracking-wide">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-8">
              <h2 className="luxury-label text-[11px] mb-8">Order Summary</h2>
              <div className="space-y-4 font-body text-sm tracking-wide">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button variant="luxury" size="lg" className="w-full mt-8" asChild>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Link to="/shop" className="block text-center mt-4 luxury-label text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default Cart;
