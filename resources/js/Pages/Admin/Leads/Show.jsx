import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Clock, User, Edit3, Save, X, UserPlus, CheckCircle, XCircle, ThumbsUp, Trophy } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_COLORS = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  proposal_sent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  negotiation: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  won: 'bg-green-500/10 text-green-400 border-green-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ACTIVITY_ICONS = {
  created: '🆕',
  updated: '✏️',
  status_changed: '🔄',
  proposal_sent: '📄',
  converted: '🎉',
};

export default function LeadShow({ lead, services, internalNotes }) {
  const [editing, setEditing] = useState(false);
  const [statusProcessing, setStatusProcessing] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    name: lead.name,
    company: lead.company || '',
    email: lead.email,
    phone: lead.phone || '',
    country: lead.country || '',
    interested_service: lead.interested_service || '',
    notes: lead.notes || '',
    status: lead.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/leads/${lead.id}`, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      router.delete(`/admin/leads/${lead.id}`);
    }
  };

  const handleStatusChange = (newStatus, confirmMessage) => {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setStatusProcessing(true);
    router.patch(`/admin/leads/${lead.id}/status`, { status: newStatus }, {
      onFinish: () => setStatusProcessing(false),
    });
  };

  const StatusActions = () => {
    if (editing) return null;

    const actions = {
      new: (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('contacted')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="h-4 w-4" /> Approve & Contact
          </button>
          <button
            onClick={() => handleStatusChange('lost', 'Are you sure you want to reject this lead?')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
        </div>
      ),
      contacted: (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('qualified')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" /> Qualified
          </button>
          <button
            onClick={() => handleStatusChange('lost', 'Are you sure you want to mark this lead as lost?')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="h-4 w-4" /> Lost
          </button>
        </div>
      ),
      qualified: (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('proposal_sent')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="h-4 w-4" /> Proposal Sent
          </button>
          <button
            onClick={() => handleStatusChange('lost', 'Are you sure you want to mark this lead as lost?')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="h-4 w-4" /> Lost
          </button>
        </div>
      ),
      proposal_sent: (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('negotiation')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" /> Negotiation
          </button>
          <button
            onClick={() => handleStatusChange('lost', 'Are you sure you want to mark this lead as lost?')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="h-4 w-4" /> Lost
          </button>
        </div>
      ),
      negotiation: (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('won')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Trophy className="h-4 w-4" /> Won
          </button>
          <button
            onClick={() => handleStatusChange('lost', 'Are you sure you want to mark this lead as lost?')}
            disabled={statusProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="h-4 w-4" /> Lost
          </button>
        </div>
      ),
    };

    if (!actions[lead.status]) return null;

    return (
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status]}`}>
              {STATUS_LABELS[lead.status]}
            </span>
            <span className="text-sm text-muted-foreground">→ Move to:</span>
          </div>
          {actions[lead.status]}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="Lead Details">
      <Head title={`Lead - ${lead.name}`} />

      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/leads" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Leads
          </Link>
          <div className="flex items-center gap-2">
            {lead.status === 'won' && !lead.client && (
              <Link
                href={`/admin/leads/${lead.id}/convert`}
                method="post"
                as="button"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
              >
                <UserPlus className="h-4 w-4" /> Convert to Client
              </Link>
            )}
            {lead.client && (
              <Link
                href={`/admin/clients/${lead.client.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" /> View Client
              </Link>
            )}
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

        <StatusActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Name <span className="text-primary">*</span></label>
                      <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`form-input ${errors.name ? 'border-destructive' : ''}`} />
                      {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="form-label">Email <span className="text-primary">*</span></label>
                      <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`form-input ${errors.email ? 'border-destructive' : ''}`} />
                      {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Company</label>
                      <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="form-input" />
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
                      <label className="form-label">Interested Service</label>
                      <select value={data.interested_service} onChange={(e) => setData('interested_service', e.target.value)} className="form-input">
                        <option value="">Select a service...</option>
                        {Object.entries(services).map(([slug, title]) => (
                          <option key={slug} value={slug}>{title}</option>
                        ))}
                        <option value="not-sure">Not sure yet</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Notes</label>
                    <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="4" className="form-input resize-y" />
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
                    <h2 className="text-xl font-semibold text-foreground">{lead.name}</h2>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status]}`}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                      <p className="text-foreground mt-1"><a href={`mailto:${lead.email}`} className="text-primary hover:text-primary/80">{lead.email}</a></p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</label>
                      <p className="text-foreground mt-1">{lead.phone || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Company</label>
                      <p className="text-foreground mt-1">{lead.company || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Country</label>
                      <p className="text-foreground mt-1">{lead.country || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Interested Service</label>
                      <p className="text-foreground mt-1 capitalize">{lead.interested_service?.replace('-', ' ') || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Created</label>
                      <p className="text-foreground mt-1">{new Date(lead.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {lead.notes && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</label>
                      <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{lead.notes}</p>
                    </div>
                  )}

                  {/* Campaign Tracking Data */}
                  {(lead.utm_source || lead.utm_campaign || lead.landing_url || lead.referrer) && (
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Campaign Data</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {lead.utm_source && (
                          <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground ml-1">{lead.utm_source}</span></div>
                        )}
                        {lead.utm_medium && (
                          <div><span className="text-muted-foreground">Medium:</span> <span className="text-foreground ml-1">{lead.utm_medium}</span></div>
                        )}
                        {lead.utm_campaign && (
                          <div><span className="text-muted-foreground">Campaign:</span> <span className="text-foreground ml-1">{lead.utm_campaign}</span></div>
                        )}
                        {lead.utm_content && (
                          <div><span className="text-muted-foreground">Content:</span> <span className="text-foreground ml-1">{lead.utm_content}</span></div>
                        )}
                        {lead.utm_term && (
                          <div><span className="text-muted-foreground">Term:</span> <span className="text-foreground ml-1">{lead.utm_term}</span></div>
                        )}
                        {lead.gclid && (
                          <div><span className="text-muted-foreground">GCLID:</span> <span className="text-foreground ml-1 text-xs break-all">{lead.gclid}</span></div>
                        )}
                        {lead.fbclid && (
                          <div><span className="text-muted-foreground">FBCLID:</span> <span className="text-foreground ml-1 text-xs break-all">{lead.fbclid}</span></div>
                        )}
                        {lead.msclkid && (
                          <div><span className="text-muted-foreground">MSCLKID:</span> <span className="text-foreground ml-1 text-xs break-all">{lead.msclkid}</span></div>
                        )}
                        {lead.landing_url && (
                          <div className="sm:col-span-2"><span className="text-muted-foreground">Landing Page:</span> <span className="text-foreground ml-1 text-xs break-all">{lead.landing_url}</span></div>
                        )}
                        {lead.referrer && (
                          <div className="sm:col-span-2"><span className="text-muted-foreground">Referrer:</span> <span className="text-foreground ml-1 text-xs break-all">{lead.referrer}</span></div>
                        )}
                        {lead.browser && (
                          <div><span className="text-muted-foreground">Browser:</span> <span className="text-foreground ml-1">{lead.browser}</span></div>
                        )}
                        {lead.device && (
                          <div><span className="text-muted-foreground">Device:</span> <span className="text-foreground ml-1 capitalize">{lead.device}</span></div>
                        )}
                        {lead.ip_address && (
                          <div><span className="text-muted-foreground">IP:</span> <span className="text-foreground ml-1">{lead.ip_address}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {lead.contact && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Linked to contact submission #{lead.contact.id} •{' '}
                        <Link href={`/admin/contacts/${lead.contact.id}`} className="text-primary hover:text-primary/80">View Contact →</Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Activity Timeline
              </h3>
              {lead.activities && lead.activities.length > 0 ? (
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="relative pl-6 pb-4 border-l border-border last:border-0 last:pb-0">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-card border-2 border-primary" />
                      <div>
                        <p className="text-sm text-foreground">
                          <span className="mr-1">{ACTIVITY_ICONS[activity.type] || '📌'}</span>
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          {activity.user && <><User className="h-3 w-3" /> {activity.user.name} • </>}
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <NotesSection notableType="lead" notableId={lead.id} notes={internalNotes || []} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
