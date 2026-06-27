import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, Package, Image } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import RichTextEditor from '@/Components/RichTextEditor';

export default function ProductForm({ product }) {
  const isEditing = !!product;
  const [preview, setPreview] = useState(product?.logo || null);
  const [screenshotPreviews, setScreenshotPreviews] = useState(product?.screenshots || []);

  const { data, setData, processing, errors } = useForm({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    summary: product?.summary || '',
    details: product?.details || '',
    features: product?.features || [],
    features_detail: product?.features_detail || '',
    screenshots: product?.screenshots || [],
    logo: product?.logo || '',
    logo_file: null,
    screenshot_files: [],
    link: product?.link || '',
    demo_link: product?.demo_link || '',
    demo_credentials: product?.demo_credentials || '',
    sort_order: product?.sort_order || 0,
    is_active: product?.is_active ?? true,
    status: product?.status || 'active',
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

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setData('screenshot_files', [...data.screenshot_files, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setScreenshotPreviews([...screenshotPreviews, ...newPreviews]);
    }
  };

  const removeScreenshot = (index) => {
    // Check if it's an existing screenshot or a new upload
    const existingCount = data.screenshots.length;
    if (index < existingCount) {
      const updated = data.screenshots.filter((_, i) => i !== index);
      setData('screenshots', updated);
      setScreenshotPreviews(screenshotPreviews.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCount;
      const updatedFiles = data.screenshot_files.filter((_, i) => i !== fileIndex);
      setData('screenshot_files', updatedFiles);
      setScreenshotPreviews(screenshotPreviews.filter((_, i) => i !== index));
    }
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
    formData.append('summary', data.summary || '');
    formData.append('details', data.details || '');
    formData.append('features_detail', data.features_detail || '');
    formData.append('logo', data.logo || '');
    formData.append('link', data.link || '');
    formData.append('demo_link', data.demo_link || '');
    formData.append('demo_credentials', data.demo_credentials || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('status', data.status);

    // Append features as array
    data.features.forEach((feature, i) => {
      formData.append(`features[${i}]`, feature);
    });

    // Append existing screenshots
    data.screenshots.forEach((screenshot, i) => {
      formData.append(`screenshots[${i}]`, screenshot);
    });

    if (data.logo_file) {
      formData.append('logo_file', data.logo_file);
    }

    // Append new screenshot files
    data.screenshot_files.forEach((file, i) => {
      formData.append(`screenshot_files[${i}]`, file);
    });

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

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

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
            <label className="block text-sm font-medium text-foreground mb-2">Short Description (for listing)</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="form-input resize-y" rows={2} placeholder="Brief product description for cards..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Summary (with bullet points - for product page)</label>
            <RichTextEditor content={data.summary} onChange={(html) => setData('summary', html)} />
            {errors.summary && <p className="text-sm text-destructive mt-1">{errors.summary}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product URL</label>
            <input type="text" value={data.link} onChange={(e) => setData('link', e.target.value)} className="form-input" placeholder="https://myapp.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
              <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="beta">Beta</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Visible on site</span>
              </label>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Product Logo</h3>

          {preview && (
            <div className="relative w-20 h-20">
              <img src={preview} alt="Logo preview" className="w-full h-full object-contain rounded-xl border border-border bg-background p-2" />
              <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {!preview && (
            <div className="w-20 h-20 rounded-xl border border-border bg-muted flex items-center justify-center">
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

        {/* Detail Content */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Product Details Page</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Details</label>
            <RichTextEditor content={data.details} onChange={(html) => setData('details', html)} />
            {errors.details && <p className="text-sm text-destructive mt-1">{errors.details}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Features (detailed)</label>
            <RichTextEditor content={data.features_detail} onChange={(html) => setData('features_detail', html)} />
            {errors.features_detail && <p className="text-sm text-destructive mt-1">{errors.features_detail}</p>}
          </div>

          {/* Feature Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Feature Tags (shown on cards)</label>
            <div className="space-y-2">
              {data.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="form-input flex-1 text-sm" placeholder="e.g. AI-Powered, Real-time" />
                  <button type="button" onClick={() => removeFeature(index)} className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} className="mt-2 text-sm text-primary hover:text-primary/80">+ Add Tag</button>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Screenshots</h3>

          {screenshotPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {screenshotPreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img src={src} alt={`Screenshot ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => removeScreenshot(index)} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
            <Image className="h-4 w-4" />
            Add Screenshots
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleScreenshotUpload} className="hidden" />
          </label>
          <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP. Max 5MB each.</p>
        </div>

        {/* Demo Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Demo Details</h3>
          <p className="text-sm text-muted-foreground">These are shown on the product page only if filled in.</p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Demo Link</label>
            <input type="text" value={data.demo_link} onChange={(e) => setData('demo_link', e.target.value)} className="form-input" placeholder="https://demo.myapp.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Demo Credentials / Test User Details</label>
            <textarea value={data.demo_credentials} onChange={(e) => setData('demo_credentials', e.target.value)} className="form-input resize-y" rows={4} placeholder="Username: demo@example.com&#10;Password: demo123&#10;&#10;Or any instructions for the test area..." />
            <p className="text-xs text-muted-foreground mt-1">This will be shown publicly on the product page. Include test user login details here.</p>
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
