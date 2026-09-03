import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import FlashNotification from '@/Components/FlashNotification';

export default function PublicLayout({ children }) {
  // All public-page metadata is resolved server-side and keyed consistently so
  // raw crawlers and Inertia SPA navigation see the same single set of tags.
  const { canonicalUrl, seoMeta, seoFallback } = usePage().props;
  const keywords = seoFallback?.keywords;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>
        {canonicalUrl && <link rel="canonical" head-key="canonical" href={canonicalUrl} />}
        {seoMeta && <>
          <meta name="description" head-key="description" content={seoMeta.description} />
          <meta property="og:type" head-key="og:type" content={seoMeta.type === 'article' ? 'article' : 'website'} />
          <meta property="og:title" head-key="og:title" content={seoMeta.title} />
          <meta property="og:description" head-key="og:description" content={seoMeta.description} />
          <meta property="og:url" head-key="og:url" content={seoMeta.canonical} />
          <meta property="og:site_name" head-key="og:site_name" content={seoMeta.siteName} />
          <meta property="og:locale" head-key="og:locale" content={seoMeta.locale} />
          <meta property="og:image" head-key="og:image" content={seoMeta.image} />
          <meta property="og:image:alt" head-key="og:image:alt" content={seoMeta.imageAlt} />
          <meta name="twitter:card" head-key="twitter:card" content={seoMeta.twitterCard} />
          <meta name="twitter:title" head-key="twitter:title" content={seoMeta.title} />
          <meta name="twitter:description" head-key="twitter:description" content={seoMeta.description} />
          <meta name="twitter:url" head-key="twitter:url" content={seoMeta.canonical} />
          <meta name="twitter:image" head-key="twitter:image" content={seoMeta.image} />
          <meta name="twitter:image:alt" head-key="twitter:image:alt" content={seoMeta.imageAlt} />
          {seoMeta.type === 'article' && seoMeta.publishedTime && (
            <meta property="article:published_time" head-key="article:published_time" content={seoMeta.publishedTime} />
          )}
          {seoMeta.type === 'article' && seoMeta.modifiedTime && (
            <meta property="article:modified_time" head-key="article:modified_time" content={seoMeta.modifiedTime} />
          )}
        </>}
        {keywords && <meta name="keywords" head-key="keywords" content={keywords} />}
      </Head>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FlashNotification />
    </div>
  );
}
