import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, CheckCircle, Target, Building2, Send } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected' };
const STATUS_COLORS = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ProposalShow({ proposal }) {
  const [sending, setSending] = useState(false);
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDelete = () => { if (confirm('Delete this proposal?')) router.delete(`/admin/proposals/${proposal.id}`); };
  const handleAccept = () => { if (confirm('Accept this proposal? A project will be created automatically.')) router.post(`/admin/proposals/${proposal.id}/accept`); };
  const handleSend = () => {
    if (!confirm('Send this proposal via email to the linked lead/client?')) return;
    setSending(true);
    router.post(`/admin/proposals/${proposal.id}/send`, {}, {
      onFinish: () => setSending(false),
    });
  };

  return (
    <AdminLayout title="Proposal Details">
      <Head title={`Proposal - ${proposal.number}`} />

      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/proposals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Proposals
          </Link>
          <div className="flex items-center gap-2">
            {proposal.status === 'draft' && (
              <button onClick={handleSend} disabled={sending} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors font-medium">
                <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Proposal'}
              </button>
            )}
            {proposal.status === 'sent' && (
              <button onClick={handleAccept} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium">
                <CheckCircle className="h-4 w-4" /> Accept & Create Project
              </button>
            )}
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{proposal.number}</h2>
              <p className="text-lg text-foreground mt-1">{proposal.title}</p>
              <div className="flex items-center gap-4 mt-2">
                {proposal.lead && (
                  <Link href={`/admin/leads/${proposal.lead.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                    <Target className="h-3 w-3" /> Lead: {proposal.lead.name}
                  </Link>
                )}
                {proposal.client && (
                  <Link href={`/admin/clients/${proposal.client.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Client: {proposal.client.company}
                  </Link>
                )}
              </div>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[proposal.status]}`}>
              {STATUS_LABELS[proposal.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-foreground">{fmt(proposal.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeline</p>
              <p className="text-sm font-medium text-foreground">{proposal.timeline || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valid Until</p>
              <p className="text-sm font-medium text-foreground">{proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          {/* Services */}
          {proposal.services && proposal.services.length > 0 && (
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Services</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {proposal.services.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{s.replace('-', ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {proposal.deliverables && proposal.deliverables.length > 0 && (
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Deliverables</label>
              <ul className="mt-2 space-y-1">
                {proposal.deliverables.map((d, i) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing Breakdown */}
          {proposal.pricing && proposal.pricing.length > 0 && (
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Pricing</label>
              <div className="mt-2 space-y-2">
                {proposal.pricing.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-foreground">{item.description}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{fmt(proposal.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          {proposal.terms && (
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Terms & Conditions</label>
              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{proposal.terms}</p>
            </div>
          )}

          {proposal.notes && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</label>
              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{proposal.notes}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
