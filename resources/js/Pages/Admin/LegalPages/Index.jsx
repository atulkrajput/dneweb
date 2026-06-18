import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function LegalPagesIndex({ pages }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this page?')) {
      router.delete(`/admin/legal-pages/${id}`);
    }
  };

  return (
    <AdminLayout title="Legal Pages">
      <Head title="Legal Pages" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{pages.length} pages</p>
        <Link href="/admin/legal-pages/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Page
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <code className="text-xs bg-muted px-2 py-1 rounded">/page/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${page.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {page.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {page.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <a href={`/page/${page.slug}`} target="_blank" rel="noopener" className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Preview">
                      <Eye className="h-4 w-4" />
                    </a>
                    <Link href={`/admin/legal-pages/${page.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(page.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    No pages yet. Create your Privacy Policy and Terms of Service.
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
