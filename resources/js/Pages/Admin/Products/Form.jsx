import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, Package } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductForm({ product }) {
  const isEditing = !!product;
  const [preview, setPreview] = useState(product?.logo || null);

  const { data, setData, processing, errors } = useForm({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    features: product?.features || [],
    logo: product?.logo || '',
    logo_file: null,
    link: product?.link || '',
    sort_order: product?.sort_order || 0,
    is_active: product?.is_active ?? true,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('logo_file', file);
      setData('logo', '');
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setData('logo_file', null);
    setData('logo', '');
    setPreview(null);
  };

  const addFeature = () => {
    setData('features', [...data.features, '']);
  };

  const updateFeature = (index, value) => {
    const updated = [...data.features];
    updated[index] = value;
    setData('features', updated);
  };

  const removeFeature = (index) => {
    setData('features', data.features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('description', data.description || '');
    formData.append('logo', data.logo || '');
    formData.append('link', data.link || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');

    // Append features as array
    data.features.forEach((feature, i) => {
      formData.append(`features[${i}]`, feature);
    });

    if (data.logo_file) {
      formData.append('logo_file', data.logo_file);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/products/${product.id}`, formData, { forceFormData: true });
    } else {
      router.post('/admin/products', formData, { forceFormData: true });
    }
  };

  return (
    <AdminLayout title={isEditing ? `Edit: ${product.name}` : 'Add Product'}>
      <Head title={isEditing ? `Edit ${product.name}` : 'Add Product'} />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
              <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="form-input" placeholder="My SaaS App" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="form-input" placeholder="my-saas-app" />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="form-input resize-y" rows={3} placeholder="What does this product do?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product URL</label>
            <input type="text" value={data.link} onChange={(e) => setData('link', e.target.value)} className="form-input" placeholder="https://myapp.com" />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Product Logo</label>

            {preview && (
              <div className="relative w-20 h-20 mb-4">
                <img src={preview} alt="Logo preview" className="w-full h-full object-contain rounded-xl border border-border bg-background p-2" />
                <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {!preview && (
              <div className="w-20 h-20 mb-4 rounded-xl border border-border bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
                <Upload className="h-4 w-4" />
                Upload Logo
                <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFileChange} className="hidden" />
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter URL:</span>
                <input
                  type="text"
                  value={data.logo}
                  onChange={(e) => { setData('logo', e.target.value); setData('logo_file', null); setPreview(e.target.value || null); }}
                  className="form-input flex-1 text-sm"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP, SVG. Max 2MB.</p>
            </div>
            {errors.logo_file && <p className="text-sm text-destructive mt-1">{errors.logo_file}</p>}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Features / Tags</label>
            <div className="space-y-2">
              {data.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="form-input flex-1 text-sm" placeholder="e.g. AI-Powered, Real-time, Multi-tenant" />
                  <button type="button" onClick={() => removeFeature(index)} className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} className="mt-2 text-sm text-primary hover:text-primary/80">+ Add Feature</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
              <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)} className="form-input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
          <Link href="/admin/products" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}
