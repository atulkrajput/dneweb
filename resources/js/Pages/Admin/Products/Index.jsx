import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ExternalLink, Eye } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductsIndex({ products }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      router.delete(`/admin/products/${id}`);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      coming_soon: 'bg-yellow-500/20 text-yellow-400',
      beta: 'bg-blue-500/20 text-blue-400',
      deprecated: 'bg-red-500/20 text-red-400',
    };
    const labels = {
      active: 'Active',
      coming_soon: 'Coming Soon',
      beta: 'Beta',
      deprecated: 'Deprecated',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${styles[status] || styles.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <AdminLayout title="SaaS Products">
      <Head title="Manage Products" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{products.length} products</p>
        <Link href="/admin/products/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Interests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{product.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {(product.icon || product.logo) && (
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={product.icon || product.logo} alt={product.name} className="w-6 h-6 object-contain" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.features && product.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.features.map((f, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{statusBadge(product.status)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {product.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{product.interests_count || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{product.views || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link href={`/admin/products/${product.id}`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="View interests">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {product.link && (
                      <a href={product.link} target="_blank" rel="noopener" className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Visit site">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/admin/products/${product.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="inline-flex p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No products yet. Add your first SaaS product.
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
