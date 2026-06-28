import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, Image } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PartnerForm({ partner }) {
  const isEditing = !!partner;
  const [logoPreview, setLogoPreview] = useState(partner?.logo || null);

  const { data, setData, processing, errors } = useForm({
    name: partner?.name || '',
    logo: partner?.logo || '',
    logo_file: null,
    website: partner?.website || '',
    sort_order: partner?.sort_order || 0,
    is_active: partner?.is_active ?? true,
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('logo_file', file);
      setData('logo', '');
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setData('logo_file', null);
    setData('logo', '');
    setLogoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('logo', data.logo || '');
    formData.append('website', data.website || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');

    if (data.logo_file) {
      formData.append('logo_file', data.logo_file);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/partners/${partner.id}`, formData, { forceFormData: true });
    } else {
      router.post('/admin/partners', formData, { forceFormData: true });
    }
  };

  return (
    <AdminLayout title={isEditing ? 'Edit Partner' : 'Add Partner'}>
      <Head title={isEditing ? 'Edit Partner' : 'Add Partner'} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Partner Name *</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="form-input" placeholder="Partner company name" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Website</label>
            <input type="text" value={data.website} onChange={(e) => setData('website', e.target.value)} className="form-input" placeholder="https://partner.com" />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Partner Logo *</label>

            {logoPreview && (
              <div className="relative w-40 h-24 mb-4">
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-xl border border-border bg-background p-2" />
                <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {!logoPreview && (
              <div className="w-40 h-24 mb-4 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
                <Upload className="h-4 w-4" />
                Upload Logo
                <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoChange} className="hidden" />
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter URL:</span>
                <input
                  type="text"
                  value={data.logo}
                  onChange={(e) => { setData('logo', e.target.value); setData('logo_file', null); setLogoPreview(e.target.value || null); }}
                  className="form-input flex-1 text-sm"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP, SVG. Max 2MB.</p>
            </div>
            {errors.logo_file && <p className="text-sm text-destructive mt-1">{errors.logo_file}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
              <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)} className="form-input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Visible on site</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Partner' : 'Create Partner')}
          </button>
          <Link href="/admin/partners" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}
