import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PartnersIndex({ partners }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      router.delete(`/admin/partners/${id}`);
    }
  };

  return (
    <AdminLayout title="Partners">
      <Head title="Manage Partners" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{partners.length} partners</p>
        <Link href="/admin/partners/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Partner
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{partner.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {partner.logo && (
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={partner.logo} alt={partner.name} className="w-8 h-8 object-contain" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground">{partner.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noopener" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {partner.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${partner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {partner.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link href={`/admin/partners/${partner.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(partner.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No partners yet. Add your first partner logo.
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
