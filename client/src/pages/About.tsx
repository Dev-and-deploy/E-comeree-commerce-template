import React from 'react';
import StoreLayout from '@/components/layout/StoreLayout';
import { motion } from 'framer-motion';
import heroImage1 from '@/assets/hero-1.jpg';

const About = () => (
  <StoreLayout>
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <p className="luxury-label text-[10px] tracking-[0.4em] text-muted-foreground mb-4">Our Story</p>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight mb-8">About MAISON</h1>
            <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed tracking-wide">
              <p>Founded on the principle that luxury should be timeless, MAISON curates exceptional pieces from the world's finest ateliers and emerging designers.</p>
              <p>Every item in our collection is selected for its craftsmanship, materiality, and enduring design. We believe in quality over quantity — fewer, better things.</p>
              <p>Our mission is to offer a refined shopping experience that celebrates the art of dressing well, without compromise.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="aspect-[3/4] overflow-hidden">
              <img src={heroImage1} alt="About MAISON" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </StoreLayout>
);

export default About;
