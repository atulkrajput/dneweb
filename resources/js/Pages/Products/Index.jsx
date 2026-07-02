import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProductsIndex({ products }) {
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
    return status && status !== 'active' ? (
      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    ) : null;
  };

  return (
    <PublicLayout>
      <Head title="Our Products | DNE Consultants" />

      {/* Hero */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-muted/50 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="eyebrow">Our Products</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Products Built by DNE
            </h1>
            <p className="text-lg text-muted-foreground">
              We don't just build for clients — we build products of our own. Explore our suite of SaaS solutions designed to solve real business problems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  className="group bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  {/* Logo or Icon */}
                  {(product.icon || product.logo) && (
                    <div className="w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden mb-4">
                      <img src={product.icon || product.logo} alt={product.name} className="w-10 h-10 object-contain" />
                    </div>
                  )}

                  {/* Name & Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                    {statusBadge(product.status)}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-muted-foreground leading-relaxed mb-4 flex-1">{product.description}</p>
                  )}

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.features.map((feature, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{feature}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                    <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                      View Details <ArrowRight className="h-3 w-3" />
                    </Link>
                    {product.link && (
                      <a href={product.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">Products coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
