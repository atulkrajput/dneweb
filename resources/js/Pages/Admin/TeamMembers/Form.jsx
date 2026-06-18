import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Upload, X, User } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TeamMemberForm({ member }) {
  const isEditing = !!member;
  const [preview, setPreview] = useState(member?.photo || null);

  const { data, setData, post, processing, errors } = useForm({
    name: member?.name || '',
    role: member?.role || '',
    bio: member?.bio || '',
    photo: member?.photo || '',
    photo_file: null,
    sort_order: member?.sort_order || 0,
    is_active: member?.is_active ?? true,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo_file', file);
      setData('photo', '');
      setPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setData('photo_file', null);
    setData('photo', '');
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('role', data.role);
    formData.append('bio', data.bio || '');
    formData.append('photo', data.photo || '');
    formData.append('sort_order', data.sort_order);
    formData.append('is_active', data.is_active ? '1' : '0');

    if (data.photo_file) {
      formData.append('photo_file', data.photo_file);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/team/${member.id}`, formData, {
        forceFormData: true,
      });
    } else {
      router.post('/admin/team', formData, {
        forceFormData: true,
      });
    }
  };

  return (
    <AdminLayout title={isEditing ? 'Edit Team Member' : 'Add Team Member'}>
      <Head title={isEditing ? 'Edit Team Member' : 'Add Team Member'} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="form-input" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role *</label>
            <input type="text" value={data.role} onChange={(e) => setData('role', e.target.value)} className="form-input" />
            {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
            <textarea value={data.bio} onChange={(e) => setData('bio', e.target.value)} className="form-input resize-y" rows={3} />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Photo</label>

            {/* Preview */}
            {preview && (
              <div className="relative w-32 h-32 mb-4">
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-border" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {!preview && (
              <div className="w-32 h-32 mb-4 rounded-xl border border-border bg-muted flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Upload button */}
            <div className="flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
                <Upload className="h-4 w-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Or enter URL */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter URL:</span>
                <input
                  type="text"
                  value={data.photo}
                  onChange={(e) => {
                    setData('photo', e.target.value);
                    setData('photo_file', null);
                    setPreview(e.target.value || null);
                  }}
                  className="form-input flex-1 text-sm"
                  placeholder="https://..."
                />
              </div>

              <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP. Max 2MB.</p>
            </div>

            {errors.photo_file && <p className="text-sm text-destructive mt-1">{errors.photo_file}</p>}
            {errors.photo && <p className="text-sm text-destructive mt-1">{errors.photo}</p>}
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
            {processing ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
          <Link href="/admin/team" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}
