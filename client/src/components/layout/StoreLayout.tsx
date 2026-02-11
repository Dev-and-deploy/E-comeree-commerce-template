import React from 'react';
import Header from './Header';
import Footer from './Footer';

const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-[calc(2rem+4rem)]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default StoreLayout;
