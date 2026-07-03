import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Edit3, Save, X, Target, Plus, FolderKanban } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  churned: 'Churned',
};

const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  churned: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ClientShow({ client, internalNotes }) {
  const [editing, setEditing] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    company: client.company,
    contact_person: client.contact_person,
    email: client.email,
    phone: client.phone || '',
    address: client.address || '',
    country: client.country || '',
    gst_vat: client.gst_vat || '',
    industry: client.industry || '',
    notes: client.notes || '',
    status: client.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/clients/${client.id}`, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this client?')) {
      router.delete(`/admin/clients/${client.id}`);
    }
  };

  return (
    <AdminLayout title="Client Details">
      <Head title={`Client - ${client.company}`} />

      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Company <span className="text-primary">*</span></label>
                  <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className={`form-input ${errors.company ? 'border-destructive' : ''}`} />
                  {errors.company && <p className="mt-1 text-sm text-destructive">{errors.company}</p>}
                </div>
                <div>
                  <label className="form-label">Contact Person <span className="text-primary">*</span></label>
                  <input type="text" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} className={`form-input ${errors.contact_person ? 'border-destructive' : ''}`} />
                  {errors.contact_person && <p className="mt-1 text-sm text-destructive">{errors.contact_person}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Email <span className="text-primary">*</span></label>
                  <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`form-input ${errors.email ? 'border-destructive' : ''}`} />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Country</label>
                  <input type="text" value={data.country} onChange={(e) => setData('country', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <input type="text" value={data.industry} onChange={(e) => setData('industry', e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">GST / VAT</label>
                  <input type="text" value={data.gst_vat} onChange={(e) => setData('gst_vat', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Address</label>
                <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows="2" className="form-input resize-y" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="3" className="form-input resize-y" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Save className="h-4 w-4" /> {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">{client.company}</h2>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[client.status]}`}>
                  {STATUS_LABELS[client.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Contact Person</label>
                  <p className="text-foreground mt-1">{client.contact_person}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                  <p className="text-foreground mt-1"><a href={`mailto:${client.email}`} className="text-primary hover:text-primary/80">{client.email}</a></p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</label>
                  <p className="text-foreground mt-1">{client.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Country</label>
                  <p className="text-foreground mt-1">{client.country || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Industry</label>
                  <p className="text-foreground mt-1">{client.industry || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">GST / VAT</label>
                  <p className="text-foreground mt-1">{client.gst_vat || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Client Since</label>
                  <p className="text-foreground mt-1">{new Date(client.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {client.address && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Address</label>
                  <p className="text-foreground mt-2 whitespace-pre-wrap">{client.address}</p>
                </div>
              )}

              {client.notes && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</label>
                  <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{client.notes}</p>
                </div>
              )}

              {client.lead && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Converted from lead •{' '}
                    <Link href={`/admin/leads/${client.lead.id}`} className="text-primary hover:text-primary/80">View Lead →</Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projects Section */}
        {!editing && (
          <div className="bg-card border border-border rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" /> Projects
              </h3>
              <Link href={`/admin/projects/create?client_id=${client.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="h-3 w-3" /> New Project
              </Link>
            </div>
            {client.projects && client.projects.length > 0 ? (
              <div className="space-y-3">
                {client.projects.map((project) => (
                  <Link key={project.id} href={`/admin/projects/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{project.status?.replace('_', ' ')} • {project.progress}% complete</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            )}
          </div>
        )}

        {/* Notes */}
        {!editing && (
          <div className="mt-6">
            <NotesSection notableType="client" notableId={client.id} notes={internalNotes || []} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
