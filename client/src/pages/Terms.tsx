import React from 'react';
import StoreLayout from '@/components/layout/StoreLayout';

const Terms = () => (
  <StoreLayout>
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <h1 className="font-display text-4xl font-light tracking-tight mb-8">Terms & Conditions</h1>
      <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed tracking-wide">
        <p>By using MAISON, you agree to these terms. Please read them carefully.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">Orders & Shipping</h2>
        <p>Orders are confirmed upon receipt of payment. Complimentary shipping is offered on orders over $500. Standard delivery takes 3-5 business days.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">Returns</h2>
        <p>Items may be returned within 14 days of delivery in original condition. Final sale items are non-returnable.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">Intellectual Property</h2>
        <p>All content on this site is the property of MAISON and may not be reproduced without permission.</p>
      </div>
    </div>
  </StoreLayout>
);

export default Terms;
