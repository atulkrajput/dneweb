import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import FlashNotification from '@/Components/FlashNotification';

export default function PublicLayout({ children }) {
  const { canonicalUrl, seoMeta, seoFallback } = usePage().props;
  const keywords = seoFallback?.keywords;
  const headElements = [];

  if (canonicalUrl) {
    headElements.push(<link key="canonical" rel="canonical" head-key="canonical" href={canonicalUrl} />);
  }

  if (seoMeta) {
    headElements.push(
      <meta key="description" name="description" head-key="description" content={seoMeta.description} />,
      <meta key="og:type" property="og:type" head-key="og:type" content={seoMeta.type === 'article' ? 'article' : 'website'} />,
      <meta key="og:title" property="og:title" head-key="og:title" content={seoMeta.title} />,
      <meta key="og:description" property="og:description" head-key="og:description" content={seoMeta.description} />,
      <meta key="og:url" property="og:url" head-key="og:url" content={seoMeta.canonical} />,
      <meta key="og:site_name" property="og:site_name" head-key="og:site_name" content={seoMeta.siteName} />,
      <meta key="og:locale" property="og:locale" head-key="og:locale" content={seoMeta.locale} />,
      <meta key="og:image" property="og:image" head-key="og:image" content={seoMeta.image} />,
      <meta key="og:image:alt" property="og:image:alt" head-key="og:image:alt" content={seoMeta.imageAlt} />,
      <meta key="twitter:card" name="twitter:card" head-key="twitter:card" content={seoMeta.twitterCard} />,
      <meta key="twitter:title" name="twitter:title" head-key="twitter:title" content={seoMeta.title} />,
      <meta key="twitter:description" name="twitter:description" head-key="twitter:description" content={seoMeta.description} />,
      <meta key="twitter:url" name="twitter:url" head-key="twitter:url" content={seoMeta.canonical} />,
      <meta key="twitter:image" name="twitter:image" head-key="twitter:image" content={seoMeta.image} />,
      <meta key="twitter:image:alt" name="twitter:image:alt" head-key="twitter:image:alt" content={seoMeta.imageAlt} />,
    );

    if (seoMeta.type === 'article' && seoMeta.publishedTime) {
      headElements.push(
        <meta key="article:published_time" property="article:published_time" head-key="article:published_time" content={seoMeta.publishedTime} />,
      );
    }

    if (seoMeta.type === 'article' && seoMeta.modifiedTime) {
      headElements.push(
        <meta key="article:modified_time" property="article:modified_time" head-key="article:modified_time" content={seoMeta.modifiedTime} />,
      );
    }
  }

  if (keywords) {
    headElements.push(<meta key="keywords" name="keywords" head-key="keywords" content={keywords} />);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>{headElements}</Head>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FlashNotification />
    </div>
  );
}
