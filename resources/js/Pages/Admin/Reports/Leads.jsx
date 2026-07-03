import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal_sent: 'Proposal Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
const STATUS_COLORS = { new: 'bg-blue-500', contacted: 'bg-yellow-500', qualified: 'bg-purple-500', proposal_sent: 'bg-orange-500', negotiation: 'bg-cyan-500', won: 'bg-green-500', lost: 'bg-red-500' };

export default function LeadsReport({ data, summary, filters }) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);

  const handleFilter = (e) => { e.preventDefault(); router.get('/admin/reports/leads', { date_from: dateFrom, date_to: dateTo }, { preserveState: true }); };

  const funnelTotal = Object.values(summary.by_status || {}).reduce((s, v) => s + v, 0) || 1;

  return (
    <AdminLayout title="Leads Report">
      <Head title="Leads Report" />

      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/reports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Link>
          <a href={`/admin/reports/leads?date_from=${dateFrom}&date_to=${dateTo}&export=csv`} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </div>

        {/* Filters */}
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-6">
          <div><label className="text-xs text-muted-foreground">From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-input text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-input text-sm" /></div>
          <button type="submit" className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">Apply</button>
        </form>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Total Leads</h3>
            <p className="text-3xl font-bold text-foreground">{summary.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">By Status</h3>
            <div className="space-y-2">
              {Object.entries(summary.by_status || {}).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{STATUS_LABELS[status]}</span><span className="text-foreground font-medium">{count}</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${STATUS_COLORS[status]}`} style={{ width: `${(count / funnelTotal) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sources */}
        {Object.keys(summary.by_source || {}).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Top Sources</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.by_source).map(([source, count]) => (
                <div key={source} className="px-3 py-2 bg-muted/50 rounded-lg"><span className="text-sm text-foreground font-medium">{source}</span><span className="text-xs text-muted-foreground ml-2">{count} leads</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.company || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{lead.interested_service?.replace('-', ' ') || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]?.replace('bg-', 'bg-') + '/10'} text-foreground`}>{STATUS_LABELS[lead.status]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.utm_source || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No data for this period.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
