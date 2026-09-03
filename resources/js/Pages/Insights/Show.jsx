import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';

function RelatedInsightsSlider({ relatedInsights }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 340;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-foreground">Related Insights</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {relatedInsights.map((related) => (
            <Link
              key={related.id}
              href={`/insights/${related.slug}`}
              className="group block flex-shrink-0 w-[300px] md:w-[340px] snap-start"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {related.featured_image ? (
                    <img src={related.featured_image} alt={related.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-3xl font-bold text-primary/20">{related.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {related.tags && related.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {related.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                      ))}
                    </div>
                  )}
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {related.title}
                  </h4>
                  {related.small_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{related.small_description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    {related.published_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(related.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function InsightShow({ insight, relatedInsights }) {
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbed = getYoutubeEmbedUrl(insight.youtube_link);

  return (
    <PublicLayout>
      <Head title={insight.meta_title || insight.title} />

      <article>
        {/* Hero / Header */}
        <section className="py-10 md:py-16 bg-gradient-to-b from-muted/50 to-background border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Insights
              </Link>

              {/* Tags */}
              {insight.tags && insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {insight.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {insight.title}
              </h1>

              {insight.small_description && (
                <p className="text-lg text-muted-foreground mb-6">{insight.small_description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {insight.author && (
                  <div className="flex items-center gap-3">
                    {insight.author.photo ? (
                      <img src={insight.author.photo} alt={insight.author.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{insight.author.name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{insight.author.name}</p>
                      {insight.author.position && (
                        <p className="text-xs text-muted-foreground">{insight.author.position}</p>
                      )}
                    </div>
                  </div>
                )}
                {insight.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(insight.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {insight.views || 0} views
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        {insight.featured_image && (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.img
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src={insight.featured_image}
                alt={insight.title}
                className="w-full max-h-[500px] object-cover rounded-2xl border border-border shadow-lg"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-lg prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground prose-img:rounded-xl prose-img:border prose-img:border-border"
              dangerouslySetInnerHTML={{ __html: insight.detail_description }}
            />
          </div>
        </section>

        {/* Other Images Gallery */}
        {insight.other_images && insight.other_images.length > 0 && (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insight.other_images.map((img, i) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    src={img}
                    alt={`${insight.title} - Image ${i + 1}`}
                    className="w-full h-56 object-cover rounded-xl border border-border hover:shadow-lg transition-shadow cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Video Section */}
        {(insight.video_file || youtubeEmbed) && (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Video</h3>

              {insight.video_file && (
                <video
                  src={insight.video_file}
                  className="w-full rounded-xl border border-border"
                  controls
                  preload="metadata"
                />
              )}

              {youtubeEmbed && (
                <div className="aspect-video rounded-xl overflow-hidden border border-border">
                  <iframe
                    src={youtubeEmbed}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={insight.title}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related Insights Slider */}
        {relatedInsights && relatedInsights.length > 0 && (
          <RelatedInsightsSlider relatedInsights={relatedInsights} />
        )}
      </article>
    </PublicLayout>
  );
}
