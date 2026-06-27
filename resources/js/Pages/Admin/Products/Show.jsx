import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Mail, Phone } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductShow({ product, interests }) {
  const handleDeleteInterest = (id) => {
    if (confirm('Delete this interest record?')) {
      router.delete(`/admin/products/interests/${id}`);
    }
  };

  return (
    <AdminLayout title={`${product.name} — Interests`}>
      <Head title={`${product.name} Interests`} />

      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{product.name}</h2>
          <p className="text-sm text-muted-foreground">{product.interests_count} interest submissions</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interests.data.map((interest) => (
                <tr key={interest.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{interest.name}</td>
                  <td className="px-6 py-4">
                    <a href={`mailto:${interest.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {interest.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {interest.mobile ? (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {interest.mobile}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-xs truncate">{interest.message || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(interest.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteInterest(interest.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {interests.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No interest submissions yet for this product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {interests.last_page > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {interests.from}-{interests.to} of {interests.total}
            </p>
            <div className="flex gap-2">
              {interests.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.url || '#'}
                  className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
