import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ServicesIndex({ services }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      router.delete(`/admin/services/${id}`);
    }
  };

  return (
    <AdminLayout title="Services">
      <Head title="Manage Services" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{services.length} services</p>
        <Link href="/admin/services/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Service
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.sort_order}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{service.title}</p>
                    <p className="text-xs text-muted-foreground">{service.subtitle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/services/${service.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(service.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
