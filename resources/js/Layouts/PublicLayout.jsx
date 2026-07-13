import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import FlashNotification from '@/Components/FlashNotification';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FlashNotification />
    </div>
  );
}
