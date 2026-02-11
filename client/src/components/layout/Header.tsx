import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, userRole } = useAuth();
  const { settings } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const siteName = settings?.site_name || 'MAISON';

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?category=dresses', label: 'Dresses' },
    { to: '/shop?category=outerwear', label: 'Outerwear' },
    { to: '/shop?category=accessories', label: 'Accessories' },
    { to: '/about', label: 'About' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-1.5 text-center">
        <p className="luxury-label text-[10px] tracking-[0.3em]">Complimentary Shipping on Orders Over $500</p>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Nav left */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 3).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`luxury-label text-[11px] transition-opacity hover:opacity-60 ${isActive(link.to) ? 'opacity-100' : 'opacity-70'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl tracking-[0.15em] font-light">
            {siteName}
          </Link>

          {/* Nav right */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(3).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`luxury-label text-[11px] transition-opacity hover:opacity-60 ${isActive(link.to) ? 'opacity-100' : 'opacity-70'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <Link to="/search" className="hover:opacity-60 transition-opacity">
              <Search className="h-4 w-4" />
            </Link>
            <Link to={user ? (userRole === 'super_admin' || userRole === 'admin' ? '/admin' : '/account') : '/auth'} className="hover:opacity-60 transition-opacity">
              <User className="h-4 w-4" />
            </Link>
            <Link to="/cart" className="relative hover:opacity-60 transition-opacity">
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[9px] w-4 h-4 flex items-center justify-center font-body">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col py-6 px-6 gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="luxury-label text-[11px] py-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
