import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TeamMemberForm({ member }) {
  const isEditing = !!member;

  const { data, setData, post, put, processing, errors } = useForm({
    name: member?.name || '',
    role: member?.role || '',
    bio: member?.bio || '',
    photo: member?.photo || '',
    sort_order: member?.sort_order || 0,
    is_active: member?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(`/admin/team/${member.id}`);
    } else {
      post('/admin/team');
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Photo URL</label>
            <input type="text" value={data.photo} onChange={(e) => setData('photo', e.target.value)} className="form-input" placeholder="https://..." />
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
