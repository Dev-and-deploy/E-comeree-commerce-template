import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/api';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'United States',
  });

  const shipping = totalPrice >= 500 ? 0 : 25;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to complete your order');
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        subtotal: totalPrice,
        shipping_cost: shipping,
        tax,
        total,
        shipping_address: {
          name: `${form.firstName} ${form.lastName}`,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))
      };

      const response = await apiClient.createOrder(orderData);
      
      if (response.success) {
        clearCart();
        navigate('/order-confirmation?id=' + response.data._id);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-4xl font-light mb-4">No Items to Checkout</h1>
          <Button variant="outline" asChild><Link to="/shop">Shop Now</Link></Button>
        </div>
      </StoreLayout>
    );
  }

  const inputClass = "w-full bg-transparent border-b border-border py-3 font-body text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors";

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-light tracking-tight mb-12">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            {/* Contact */}
            <div>
              <h2 className="luxury-label text-[11px] mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="First Name" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inputClass} />
                <input placeholder="Last Name" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inputClass} />
                <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} />
                <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="luxury-label text-[11px] mb-6">Shipping Address</h2>
              <div className="space-y-6">
                <input placeholder="Address" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputClass} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input placeholder="City" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputClass} />
                  <input placeholder="State" required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className={inputClass} />
                  <input placeholder="ZIP Code" required value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Payment mock */}
            <div>
              <h2 className="luxury-label text-[11px] mb-6">Payment</h2>
              <div className="bg-secondary p-6">
                <p className="font-body text-sm text-muted-foreground tracking-wide">
                  Mock payment — your order will be confirmed automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-secondary p-8 sticky top-32">
              <h2 className="luxury-label text-[11px] mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between font-body text-xs tracking-wide">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-3 font-body text-sm tracking-wide">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t border-border pt-3 flex justify-between font-medium">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button variant="luxury" size="lg" className="w-full mt-8" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
};

export default Checkout;
