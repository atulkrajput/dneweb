import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, Image } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ServiceForm({ service }) {
  const isEditing = !!service;
  const [imagePreview, setImagePreview] = useState(service?.image || null);

  const { data, setData, processing, errors } = useForm({
    slug: service?.slug || '',
    tag: service?.tag || '',
    title: service?.title || '',
    subtitle: service?.subtitle || '',
    description: service?.description || '',
    checklist: service?.checklist || [],
    callout: service?.callout || '',
    image: service?.image || '',
    image_file: null,
    button_text: service?.button_text || 'Learn More',
    button_link: service?.button_link || '/contact',
    icon: service?.icon || '',
    sort_order: service?.sort_order || 0,
    is_active: service?.is_active ?? true,
  });

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image_file', file);
      setData('image', '');
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setData('image_file', null);
    setData('image', '');
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('slug', data.slug);
    formData.append('tag', data.tag);
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('description', data.description);
    formData.append('callout', data.callout || '');
    formData.append('image', data.image || '');
    formData.append('button_text', data.button_text || '');
    formData.append('button_link', data.button_link || '');
    formData.append('icon', data.icon || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');

    // Append checklist as array
    data.checklist.forEach((item, i) => {
      formData.append(`checklist[${i}]`, item);
    });

    if (data.image_file) {
      formData.append('image_file', data.image_file);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/services/${service.id}`, formData, { forceFormData: true });
    } else {
      router.post('/admin/services', formData, { forceFormData: true });
    }
  };

  const addChecklistItem = () => {
    setData('checklist', [...data.checklist, '']);
  };

  const updateChecklistItem = (index, value) => {
    const updated = [...data.checklist];
    updated[index] = value;
    setData('checklist', updated);
  };

  const removeChecklistItem = (index) => {
    setData('checklist', data.checklist.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout title={isEditing ? 'Edit Service' : 'Create Service'}>
      <Head title={isEditing ? 'Edit Service' : 'Create Service'} />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="form-input" placeholder="ai-automation" />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tag *</label>
              <input type="text" value={data.tag} onChange={(e) => setData('tag', e.target.value)} className="form-input" placeholder="01 / AUTOMATION" />
              {errors.tag && <p className="text-sm text-destructive mt-1">{errors.tag}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="form-input" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subtitle *</label>
            <input type="text" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} className="form-input" />
            {errors.subtitle && <p className="text-sm text-destructive mt-1">{errors.subtitle}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="form-input min-h-[120px] resize-y" rows={4} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Callout (Who this is for)</label>
            <textarea value={data.callout} onChange={(e) => setData('callout', e.target.value)} className="form-input resize-y" rows={2} />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Service Image</label>

            {imagePreview && (
              <div className="relative w-full max-w-md mb-4">
                <img src={imagePreview} alt="Service image preview" className="w-full h-48 object-cover rounded-xl border border-border" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!imagePreview && (
              <div className="w-full max-w-md h-36 mb-4 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center">
                <Image className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
                <Upload className="h-4 w-4" />
                Upload Image
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileChange} className="hidden" />
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter URL:</span>
                <input
                  type="text"
                  value={data.image}
                  onChange={(e) => { setData('image', e.target.value); setData('image_file', null); setImagePreview(e.target.value || null); }}
                  className="form-input flex-1 text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP. Max 5MB.</p>
            </div>
            {errors.image_file && <p className="text-sm text-destructive mt-1">{errors.image_file}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Button Text</label>
              <input type="text" value={data.button_text} onChange={(e) => setData('button_text', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Button Link</label>
              <input type="text" value={data.button_link} onChange={(e) => setData('button_link', e.target.value)} className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
              <input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="form-input" placeholder="Bot" />
            </div>
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

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Checklist Items</label>
            <div className="space-y-2">
              {data.checklist.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={item} onChange={(e) => updateChecklistItem(index, e.target.value)} className="form-input flex-1" placeholder="Checklist item..." />
                  <button type="button" onClick={() => removeChecklistItem(index)} className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addChecklistItem} className="mt-2 text-sm text-primary hover:text-primary/80">+ Add Item</button>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
          </button>
          <Link href="/admin/services" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
