import React from 'react';
import StoreLayout from '@/components/layout/StoreLayout';

const Privacy = () => (
  <StoreLayout>
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <h1 className="font-display text-4xl font-light tracking-tight mb-8">Privacy Policy</h1>
      <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed tracking-wide">
        <p>At MAISON, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email, shipping address, and payment details when making a purchase.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">How We Use Your Information</h2>
        <p>Your information is used to process orders, provide customer service, and improve your shopping experience. We never sell your personal data.</p>
        <h2 className="font-display text-xl font-light text-foreground !mt-10">Contact</h2>
        <p>For questions about this policy, please contact us at privacy@maison.com.</p>
      </div>
    </div>
  </StoreLayout>
);

export default Privacy;
