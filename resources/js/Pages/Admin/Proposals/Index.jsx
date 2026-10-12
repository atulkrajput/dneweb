import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, FileSignature, Send, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected' };
const STATUS_COLORS = {
  draft: 'bg-gray-500/10 text-gray-400',
  sent: 'bg-blue-500/10 text-blue-400',
  accepted: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
};

export default function ProposalsIndex({ proposals, stats, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleSearch = (e) => { e.preventDefault(); router.get('/admin/proposals', { search, status: filters.status }, { preserveState: true }); };
  const handleFilterStatus = (status) => { router.get('/admin/proposals', { search: filters.search, status: status || undefined }, { preserveState: true }); };

  const statCards = [
    { label: 'Total Proposals', value: stats.total, icon: FileSignature, color: 'text-blue-400' },
    { label: 'Sent', value: stats.sent, icon: Send, color: 'text-orange-400' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' },
  ];

  return (
    <AdminLayout title="Proposals">
      <Head title="Proposals" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <span className="text-3xl font-bold text-foreground">{card.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search proposals..." className="form-input pl-9 w-full" />
          </div>
        </form>
        <Link href="/admin/proposals/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Proposal
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => handleFilterStatus(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filters.status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>All</button>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <button key={value} onClick={() => handleFilterStatus(value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.status === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>{label}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Proposal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead / Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proposals.data?.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/proposals/${proposal.id}`} className="text-sm font-medium text-foreground hover:text-primary">{proposal.number}</Link>
                    <p className="text-xs text-muted-foreground">{proposal.title}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {proposal.client?.company || proposal.lead?.company || proposal.lead?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{fmt(proposal.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[proposal.status]}`}>{STATUS_LABELS[proposal.status]}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {proposals.data?.length === 0 && <div className="p-8 text-center text-muted-foreground">No proposals found.</div>}
      </div>

      {proposals.links && proposals.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {proposals.links.map((link, i) => (
            <Link key={i} href={link.url || '#'} className={`px-3 py-2 text-sm rounded ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
