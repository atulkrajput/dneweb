import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, ArrowRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function InsightShow({ insight, relatedInsights }) {
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbed = getYoutubeEmbedUrl(insight.youtube_link);

  return (
    <PublicLayout>
      <Head>
        <title>{insight.meta_title || insight.title}</title>
        <meta name="description" content={insight.meta_description || insight.small_description || ''} />
        {insight.meta_keywords && <meta name="keywords" content={insight.meta_keywords} />}
        <meta property="og:title" content={insight.meta_title || insight.title} />
        <meta property="og:description" content={insight.meta_description || insight.small_description || ''} />
        {insight.featured_image && <meta property="og:image" content={insight.featured_image} />}
        <meta property="og:type" content="article" />
      </Head>

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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Related Insights */}
        {relatedInsights && relatedInsights.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30 border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl font-bold text-foreground mb-8">Related Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedInsights.map((related) => (
                  <Link key={related.id} href={`/insights/${related.slug}`} className="group block">
                    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
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
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {related.title}
                        </h4>
                        {related.small_description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{related.small_description}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
