import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-32 text-center max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mx-auto mb-8">
            <Check className="h-8 w-8" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="font-display text-4xl font-light mb-4">Thank You</h1>
          <p className="font-body text-sm text-muted-foreground tracking-wide mb-2">Your order has been confirmed.</p>
          {orderId && <p className="font-body text-xs text-muted-foreground tracking-wide mb-8">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild><Link to="/account">View Orders</Link></Button>
            <Button variant="luxury" asChild><Link to="/shop">Continue Shopping</Link></Button>
          </div>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default OrderConfirmation;
