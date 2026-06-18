import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductsIndex({ products }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      router.delete(`/admin/products/${id}`);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-xl p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {product.logo && (
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                    <img src={product.logo} alt={product.name} className="w-8 h-8 object-contain" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <span className={`text-xs ${product.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {product.features.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f}</span>
                ))}
                {product.features.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{product.features.length - 3} more</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
              {product.link && (
                <a href={product.link} target="_blank" rel="noopener" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Visit">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
              <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No products yet. Add your first SaaS product.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
