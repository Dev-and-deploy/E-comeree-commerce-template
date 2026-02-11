import React, { useState } from 'react';
import StoreLayout from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const inputClass = "w-full bg-transparent border-b border-border py-3 font-body text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors";

  return (
    <StoreLayout>
      <div className="container mx-auto px-6 py-16 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="luxury-label text-[10px] tracking-[0.4em] text-muted-foreground mb-3 text-center">Get in Touch</p>
          <h1 className="font-display text-4xl font-light tracking-tight mb-12 text-center">Contact Us</h1>
          <form onSubmit={e => { e.preventDefault(); toast.success('Message sent!'); setForm({ name: '', email: '', message: '' }); }} className="space-y-8">
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inputClass} />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inputClass} />
            <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={5} className={inputClass + " resize-none"} />
            <Button variant="luxury" size="lg" className="w-full" type="submit">Send Message</Button>
          </form>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default Contact;
