import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2, ArrowLeft, Calendar, Eye, Tag, ExternalLink } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function InsightShow({ insight }) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this insight?')) {
      router.delete(`/admin/insights/${insight.id}`);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbed = getYoutubeEmbedUrl(insight.youtube_link);

  return (
    <AdminLayout title={`Insight: ${insight.title}`}>
      <Head title={insight.title} />

      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/admin/insights" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Insights
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/admin/insights/${insight.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Edit className="h-4 w-4" /> Edit
            </Link>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        {/* Status & Meta */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${insight.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {insight.is_published ? 'Published' : 'Draft'}
            </span>
            {insight.published_at && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(insight.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {insight.views || 0} views
            </span>
            {insight.is_published && (
              <a href={`/insights/${insight.slug}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> View Live
              </a>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground">{insight.title}</h1>

          {insight.small_description && (
            <p className="text-muted-foreground">{insight.small_description}</p>
          )}

          {insight.tags && insight.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {insight.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Tag className="h-3 w-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {insight.featured_image && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Featured Image</h3>
            <img src={insight.featured_image} alt={insight.title} className="w-full max-h-96 object-cover rounded-lg" />
          </div>
        )}

        {/* Detail Content */}
        {insight.detail_description && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Content</h3>
            <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: insight.detail_description }} />
          </div>
        )}

        {/* Other Images */}
        {insight.other_images && insight.other_images.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Images ({insight.other_images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {insight.other_images.map((img, i) => (
                <img key={i} src={img} alt={`Image ${i + 1}`} className="w-full h-40 object-cover rounded-lg border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {(insight.video_file || youtubeEmbed) && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Video</h3>

            {insight.video_file && (
              <video src={insight.video_file} className="w-full max-h-96 rounded-lg" controls />
            )}

            {youtubeEmbed && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe src={youtubeEmbed} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}
          </div>
        )}

        {/* SEO Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">SEO Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Meta Title:</span>
              <p className="text-sm text-foreground">{insight.meta_title || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Meta Description:</span>
              <p className="text-sm text-foreground">{insight.meta_description || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Meta Keywords:</span>
              <p className="text-sm text-foreground">{insight.meta_keywords || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Slug:</span>
              <p className="text-sm text-foreground font-mono">/insights/{insight.slug}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
