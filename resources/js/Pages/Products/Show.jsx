import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Monitor, CheckCircle } from 'lucide-react';
import DynamicIcon from '@/Components/DynamicIcon';
import PublicLayout from '@/Layouts/PublicLayout';

export default function ProductShow({ product }) {
  const { flash } = usePage().props;
  const [lightboxImage, setLightboxImage] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });

  const handleInterestSubmit = (e) => {
    e.preventDefault();
    post(`/products/${product.slug}/interest`, {
      onSuccess: () => reset(),
    });
  };

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      coming_soon: 'bg-yellow-500/20 text-yellow-400',
      beta: 'bg-blue-500/20 text-blue-400',
      deprecated: 'bg-red-500/20 text-red-400',
    };
    const labels = {
      active: 'Live',
      coming_soon: 'Coming Soon',
      beta: 'Beta',
      deprecated: 'Deprecated',
    };
    return status ? (
      <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    ) : null;
  };

  return (
    <PublicLayout>
      <Head title={`${product.name} | DNE Consultants`} />

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Screenshot" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> All Products
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {product.logo ? (
                <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={product.logo} alt={product.name} className="w-14 h-14 object-contain" />
                </div>
              ) : product.icon ? (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <DynamicIcon name={product.icon} className="w-10 h-10 text-primary" />
                </div>
              ) : null}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
                  {statusBadge(product.status)}
                </div>
                {product.description && (
                  <p className="text-lg text-muted-foreground">{product.description}</p>
                )}
              </div>
              <div className="flex gap-3">
                {product.link && (
                  <a href={product.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Visit Product <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {product.demo_link && (
                  <a href={product.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                    <Monitor className="h-4 w-4" /> Try Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Tags */}
      {product.features && product.features.length > 0 && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, i) => (
                <span key={i} className="text-sm px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">{feature}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Summary */}
      {product.summary && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
              <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.summary }} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Details */}
      {product.details && (
        <section className="py-12 bg-muted/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Details</h2>
              <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.details }} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Detail */}
      {product.features_detail && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Features</h2>
              <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.features_detail }} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Screenshots */}
      {product.screenshots && product.screenshots.length > 0 && (
        <section className="py-12 bg-muted/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.screenshots.map((screenshot, i) => (
                  <button key={i} onClick={() => setLightboxImage(screenshot)} className="group overflow-hidden rounded-xl border border-border hover:border-primary/30 transition-all">
                    <img src={screenshot} alt={`${product.name} screenshot ${i + 1}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Demo Details */}
      {product.demo_credentials && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Demo Access</h2>
              <div className="bg-card border border-border rounded-xl p-6">
                {product.demo_link && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Demo URL: </span>
                    <a href={product.demo_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {product.demo_link}
                    </a>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-muted-foreground text-sm bg-muted/50 rounded-lg p-4 font-mono">
                  {product.demo_credentials}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Interest Form */}
      <section className="py-16 bg-muted/30 border-t border-border/40" id="interest-form">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">Interested in {product.name}?</h2>
              <p className="text-muted-foreground">Let us know and we'll get back to you with more details, pricing, or a personalized demo.</p>
            </div>

            {flash?.success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-400">{flash.success}</p>
              </div>
            )}

            <form onSubmit={handleInterestSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="form-input" placeholder="Your name" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="form-input" placeholder="you@company.com" />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mobile</label>
                <input type="text" value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} className="form-input" placeholder="+1 (555) 123-4567" />
                {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message / Requirements</label>
                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} className="form-input resize-y" rows={4} placeholder="Tell us about your needs, requirements, or any questions..." />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>

              <button type="submit" disabled={processing} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Submitting...' : 'Submit Interest'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
