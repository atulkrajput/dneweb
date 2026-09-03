import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import FlashNotification from '@/Components/FlashNotification';

export default function PublicLayout({ children }) {
  // Per-URL keywords resolved server-side (shared prop). Emitting here (keyed) keeps a
  // single keywords meta correct across client-side navigation on every public page,
  // and lets Inertia replace the server-rendered fallback rather than duplicate it.
  const keywords = usePage().props?.seoFallback?.keywords;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {keywords && (
        <Head>
          <meta name="keywords" head-key="keywords" content={keywords} />
        </Head>
      )}
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FlashNotification />
    </div>
  );
}
