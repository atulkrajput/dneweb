import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Monitor, CheckCircle, ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function ProductShow({ product }) {
  const { flash } = usePage().props;
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const scrollRef = useRef(null);

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
      <AnimatePresence>
        {lightboxImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <XIcon className="h-5 w-5 text-white" />
            </button>

            {product.screenshots.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxImage((lightboxImage - 1 + product.screenshots.length) % product.screenshots.length); }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxImage((lightboxImage + 1) % product.screenshots.length); }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <motion.img
              key={lightboxImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={product.screenshots[lightboxImage]}
              alt="Screenshot"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Dots */}
            {product.screenshots.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {product.screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxImage(i); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === lightboxImage ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> All Products
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {(product.icon || product.logo) && (
                <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={product.icon || product.logo} alt={product.name} className="w-14 h-14 object-contain" />
                </div>
              )}
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

      {/* Screenshots Gallery */}
      {product.screenshots && product.screenshots.length > 0 && (
        <section className="py-16 bg-muted/30 border-y border-border/40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Screenshots</h2>
                {product.screenshots.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const prev = (activeScreenshot - 1 + product.screenshots.length) % product.screenshots.length;
                        setActiveScreenshot(prev);
                        scrollRef.current?.children[prev]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }}
                      className="w-9 h-9 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {activeScreenshot + 1} / {product.screenshots.length}
                    </span>
                    <button
                      onClick={() => {
                        const next = (activeScreenshot + 1) % product.screenshots.length;
                        setActiveScreenshot(next);
                        scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }}
                      className="w-9 h-9 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Main Preview */}
              <div className="mb-6">
                <button
                  onClick={() => setLightboxImage(activeScreenshot)}
                  className="w-full overflow-hidden rounded-2xl border border-border hover:border-primary/30 transition-all bg-card group"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeScreenshot}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={product.screenshots[activeScreenshot]}
                      alt={`${product.name} screenshot ${activeScreenshot + 1}`}
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-contain bg-black/5 dark:bg-white/5 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </AnimatePresence>
                </button>
              </div>

              {/* Thumbnail Strip */}
              {product.screenshots.length > 1 && (
                <div
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                >
                  {product.screenshots.map((screenshot, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScreenshot(i)}
                      className={`flex-shrink-0 snap-center overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        i === activeScreenshot
                          ? 'border-primary ring-2 ring-primary/20 scale-105'
                          : 'border-border hover:border-primary/40 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={screenshot}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-28 h-20 sm:w-36 sm:h-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
