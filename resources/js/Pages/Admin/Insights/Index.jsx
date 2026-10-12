import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function InsightsIndex({ insights }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this insight?')) {
      router.delete(`/admin/insights/${id}`);
    }
  };

  return (
    <AdminLayout title="Insights">
      <Head title="Manage Insights" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{insights.length} insights</p>
        <Link href="/admin/insights/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Insight
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Insight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Published</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {insights.map((insight) => (
                <tr key={insight.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {insight.featured_image && (
                        <img src={insight.featured_image} alt={insight.title} className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0" />
                      )}
                      {!insight.featured_image && (
                        <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                          <Eye className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-xs">{insight.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{insight.small_description || insight.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {insight.tags && insight.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {insight.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                        ))}
                        {insight.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{insight.tags.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${insight.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {insight.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {insight.published_at ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(insight.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{insight.views || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link href={`/admin/insights/${insight.id}`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/insights/${insight.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(insight.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {insights.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No insights yet. Create your first insight to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
