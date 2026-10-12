import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import RichTextEditor from '@/Components/RichTextEditor';

export default function LegalPageForm({ page }) {
  const isEditing = !!page;

  const { data, setData, post, put, processing, errors } = useForm({
    slug: page?.slug || '',
    title: page?.title || '',
    content: page?.content || '',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    is_active: page?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(`/admin/legal-pages/${page.id}`);
    } else {
      post('/admin/legal-pages');
    }
  };

  return (
    <AdminLayout title={isEditing ? `Edit: ${page.title}` : 'Create Legal Page'}>
      <Head title={isEditing ? `Edit ${page.title}` : 'Create Legal Page'} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Page Title *</label>
              <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="form-input" placeholder="Privacy Policy" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">URL Slug *</label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">/legal/</span>
                <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="form-input" placeholder="privacy-policy" />
              </div>
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
              <span className="text-sm text-foreground">Published (visible to public)</span>
            </label>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-medium text-foreground mb-4">Page Content</label>
          <RichTextEditor content={data.content} onChange={(html) => setData('content', html)} />
          {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
        </div>

        {/* SEO */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">SEO Settings</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
            <input type="text" value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} className="form-input" placeholder="Leave blank to use page title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
            <textarea value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} className="form-input resize-y" rows={3} placeholder="Brief description for search engines..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Page' : 'Create Page')}
          </button>
          <Link href="/admin/legal-pages" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
