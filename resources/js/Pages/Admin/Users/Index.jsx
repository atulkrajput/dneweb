import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, X, Trash2, Edit3, Shield } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  sales: 'Sales',
  project_manager: 'Project Manager',
  developer: 'Developer',
  accountant: 'Accountant',
};

const ROLE_COLORS = {
  super_admin: 'bg-red-500/10 text-red-400',
  sales: 'bg-blue-500/10 text-blue-400',
  project_manager: 'bg-purple-500/10 text-purple-400',
  developer: 'bg-green-500/10 text-green-400',
  accountant: 'bg-orange-500/10 text-orange-400',
};

export default function UsersIndex({ users, roles }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const createForm = useForm({ name: '', email: '', password: '', role: 'developer' });
  const editForm = useForm({ name: '', email: '', role: '', password: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    createForm.post('/admin/users', {
      onSuccess: () => { createForm.reset(); setShowCreate(false); },
    });
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    editForm.setData({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    editForm.put(`/admin/users/${editingUser}`, {
      onSuccess: () => setEditingUser(null),
    });
  };

  const handleDelete = (user) => {
    if (confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
      router.delete(`/admin/users/${user.id}`);
    }
  };

  return (
    <AdminLayout title="User Management">
      <Head title="Users" />

      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{users.length} user(s)</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Create User</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Name <span className="text-primary">*</span></label>
                <input type="text" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} className={`form-input ${createForm.errors.name ? 'border-destructive' : ''}`} />
                {createForm.errors.name && <p className="mt-1 text-xs text-destructive">{createForm.errors.name}</p>}
              </div>
              <div>
                <label className="form-label">Email <span className="text-primary">*</span></label>
                <input type="email" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} className={`form-input ${createForm.errors.email ? 'border-destructive' : ''}`} />
                {createForm.errors.email && <p className="mt-1 text-xs text-destructive">{createForm.errors.email}</p>}
              </div>
              <div>
                <label className="form-label">Password <span className="text-primary">*</span></label>
                <input type="password" value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} className={`form-input ${createForm.errors.password ? 'border-destructive' : ''}`} />
                {createForm.errors.password && <p className="mt-1 text-xs text-destructive">{createForm.errors.password}</p>}
              </div>
              <div>
                <label className="form-label">Role <span className="text-primary">*</span></label>
                <select value={createForm.data.role} onChange={(e) => createForm.setData('role', e.target.value)} className="form-input">
                  {roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {createForm.processing ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div key={user.id}>
                {editingUser === user.id ? (
                  <form onSubmit={handleUpdate} className="p-4 bg-muted/30">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className="form-input text-sm" placeholder="Name" />
                      </div>
                      <div>
                        <input type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} className="form-input text-sm" placeholder="Email" />
                      </div>
                      <div>
                        <select value={editForm.data.role} onChange={(e) => editForm.setData('role', e.target.value)} className="form-input text-sm">
                          {roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                        </select>
                      </div>
                      <div>
                        <input type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} className="form-input text-sm" placeholder="New password (optional)" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingUser(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                      <button type="submit" disabled={editForm.processing} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 disabled:opacity-50">Save</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{user.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        <Shield className="h-3 w-3" /> {ROLE_LABELS[user.role]}
                      </span>
                      <button onClick={() => startEdit(user)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
