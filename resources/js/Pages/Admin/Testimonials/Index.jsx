import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TestimonialsIndex({ testimonials }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      router.delete(`/admin/testimonials/${id}`);
    }
  };

  return (
    <AdminLayout title="Testimonials">
      <Head title="Manage Testimonials" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{testimonials.length} testimonials</p>
        <Link href="/admin/testimonials/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{testimonial.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {testimonial.photo && (
                        <div className="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                          <img src={testimonial.photo} alt={testimonial.author} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{testimonial.company || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${testimonial.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {testimonial.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link href={`/admin/testimonials/${testimonial.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(testimonial.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No testimonials yet. Add your first client testimonial.
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
