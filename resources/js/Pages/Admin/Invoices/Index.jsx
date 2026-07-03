import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  draft: 'bg-gray-500/10 text-gray-400',
  sent: 'bg-blue-500/10 text-blue-400',
  paid: 'bg-green-500/10 text-green-400',
  overdue: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-yellow-500/10 text-yellow-400',
};

export default function InvoicesIndex({ invoices, stats, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/invoices', { search, status: filters.status }, { preserveState: true });
  };

  const handleFilterStatus = (status) => {
    router.get('/admin/invoices', { search: filters.search, status: status || undefined }, { preserveState: true });
  };

  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statCards = [
    { label: 'Total Revenue', value: fmt(stats.total_revenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'Outstanding', value: fmt(stats.outstanding), icon: Clock, color: 'text-blue-400' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Drafts', value: stats.draft, icon: FileText, color: 'text-gray-400' },
  ];

  return (
    <AdminLayout title="Invoices">
      <Head title="Invoices" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="form-input pl-9 w-full" />
          </div>
        </form>
        <Link href="/admin/invoices/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Invoice
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.data?.map((invoice) => {
                const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && ['sent', 'overdue'].includes(invoice.status);
                return (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/invoices/${invoice.id}`} className="text-sm font-medium text-foreground hover:text-primary">{invoice.number}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.client?.company || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{fmt(invoice.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status]}`}>{STATUS_LABELS[invoice.status]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {invoices.data?.length === 0 && <div className="p-8 text-center text-muted-foreground">No invoices found.</div>}
      </div>

      {invoices.links && invoices.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {invoices.links.map((link, i) => (
            <Link key={i} href={link.url || '#'} className={`px-3 py-2 text-sm rounded ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
