import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const siteName = settings?.site_name || 'MAISON';

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl tracking-[0.15em] font-light mb-4">{siteName}</h3>
            <p className="font-body text-xs text-primary-foreground/60 leading-relaxed tracking-wide">
              Curated luxury fashion for the discerning modern wardrobe.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="luxury-label text-[10px] text-primary-foreground/40 mb-6">Shop</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Dresses', 'Outerwear', 'Accessories', 'Sale'].map(item => (
                <li key={item}>
                  <Link to="/shop" className="font-body text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors tracking-wide">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="luxury-label text-[10px] text-primary-foreground/40 mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms', to: '/terms' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="font-body text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors tracking-wide">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="luxury-label text-[10px] text-primary-foreground/40 mb-6">Newsletter</h4>
            <p className="font-body text-xs text-primary-foreground/60 mb-4 tracking-wide">
              Subscribe for exclusive access and early collections.
            </p>
            <div className="flex border-b border-primary-foreground/20">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-transparent text-xs py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none font-body tracking-wide"
              />
              <button className="luxury-label text-[10px] text-primary-foreground/60 hover:text-primary-foreground transition-colors px-2">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[10px] text-primary-foreground/40 tracking-widest">
            © 2026 {siteName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Instagram', 'Pinterest', 'Twitter'].map(social => (
              <a key={social} href="#" className="font-body text-[10px] text-primary-foreground/40 hover:text-primary-foreground transition-colors tracking-widest uppercase">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
