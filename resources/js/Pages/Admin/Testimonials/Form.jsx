import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, User, Star } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TestimonialForm({ testimonial }) {
  const isEditing = !!testimonial;
  const [photoPreview, setPhotoPreview] = useState(testimonial?.photo || null);

  const { data, setData, processing, errors } = useForm({
    author: testimonial?.author || '',
    company: testimonial?.company || '',
    website: testimonial?.website || '',
    role: testimonial?.role || '',
    quote: testimonial?.quote || '',
    rating: testimonial?.rating || 5,
    photo: testimonial?.photo || '',
    photo_file: null,
    sort_order: testimonial?.sort_order || 0,
    is_active: testimonial?.is_active ?? true,
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo_file', file);
      setData('photo', '');
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setData('photo_file', null);
    setData('photo', '');
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('author', data.author);
    formData.append('company', data.company || '');
    formData.append('website', data.website || '');
    formData.append('role', data.role || '');
    formData.append('quote', data.quote);
    formData.append('rating', data.rating);
    formData.append('photo', data.photo || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');

    if (data.photo_file) {
      formData.append('photo_file', data.photo_file);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/testimonials/${testimonial.id}`, formData, { forceFormData: true });
    } else {
      router.post('/admin/testimonials', formData, { forceFormData: true });
    }
  };

  return (
    <AdminLayout title={isEditing ? 'Edit Testimonial' : 'Add Testimonial'}>
      <Head title={isEditing ? 'Edit Testimonial' : 'Add Testimonial'} />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Client Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
              <input type="text" value={data.author} onChange={(e) => setData('author', e.target.value)} className="form-input" placeholder="John Smith" />
              {errors.author && <p className="text-sm text-destructive mt-1">{errors.author}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Designation / Role</label>
              <input type="text" value={data.role} onChange={(e) => setData('role', e.target.value)} className="form-input" placeholder="CEO, CTO, Founder..." />
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company</label>
              <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="form-input" placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Website</label>
              <input type="text" value={data.website} onChange={(e) => setData('website', e.target.value)} className="form-input" placeholder="https://acme.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Testimonial *</label>
            <textarea value={data.quote} onChange={(e) => setData('quote', e.target.value)} className="form-input resize-y" rows={4} placeholder="What the client said about working with DNE..." />
            {errors.quote && <p className="text-sm text-destructive mt-1">{errors.quote}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setData('rating', star)}
                    className="p-1 transition-colors"
                  >
                    <Star className={`h-6 w-6 ${star <= data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
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

        {/* Photo / Logo Upload */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Photo / Logo</h3>
          <p className="text-sm text-muted-foreground">Upload a client photo or company logo.</p>

          {photoPreview && (
            <div className="relative w-20 h-20">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-full border border-border" />
              <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {!photoPreview && (
            <div className="w-20 h-20 rounded-full border border-border bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
              <Upload className="h-4 w-4" />
              Upload Photo
              <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handlePhotoChange} className="hidden" />
            </label>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">or enter URL:</span>
              <input
                type="text"
                value={data.photo}
                onChange={(e) => { setData('photo', e.target.value); setData('photo_file', null); setPhotoPreview(e.target.value || null); }}
                className="form-input flex-1 text-sm"
                placeholder="https://..."
              />
            </div>
            <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP, SVG. Max 2MB.</p>
          </div>
          {errors.photo_file && <p className="text-sm text-destructive mt-1">{errors.photo_file}</p>}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Testimonial' : 'Create Testimonial')}
          </button>
          <Link href="/admin/testimonials" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}
