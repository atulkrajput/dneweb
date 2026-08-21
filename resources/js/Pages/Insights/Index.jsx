import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Eye, Tag } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function InsightsIndex({ insights }) {
  return (
    <PublicLayout>
      <Head title="Insights | DNE Consultants" />

      {/* Hero */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-muted/50 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="eyebrow">Our Insights</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ideas, Stories & Expertise
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our latest thoughts on technology, design, development, and digital strategy. We share what we learn along the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Insights Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {insights.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No insights published yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {insights.map((insight) => (
                <motion.div key={insight.id} variants={fadeInUp}>
                  <Link href={`/insights/${insight.slug}`} className="group block h-full">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                      {/* Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {insight.featured_image ? (
                          <img
                            src={insight.featured_image}
                            alt={insight.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-4xl font-bold text-primary/20">{insight.title[0]}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Tags */}
                        {insight.tags && insight.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {insight.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {insight.title}
                        </h2>

                        {insight.small_description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                            {insight.small_description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {insight.published_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(insight.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {insight.views || 0}
                            </span>
                          </div>
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
