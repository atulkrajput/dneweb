import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_COLORS = { draft: 'text-gray-400', sent: 'text-blue-400', paid: 'text-green-400', overdue: 'text-red-400', cancelled: 'text-yellow-400' };

export default function RevenueReport({ invoices, summary, filters }) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleFilter = (e) => { e.preventDefault(); router.get('/admin/reports/revenue', { date_from: dateFrom, date_to: dateTo }, { preserveState: true }); };

  return (
    <AdminLayout title="Revenue Report">
      <Head title="Revenue Report" />

      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/reports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
          <a href={`/admin/reports/revenue?date_from=${dateFrom}&date_to=${dateTo}&export=csv`} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"><Download className="h-4 w-4" /> Export CSV</a>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-6">
          <div><label className="text-xs text-muted-foreground">From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-input text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-input text-sm" /></div>
          <button type="submit" className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">Apply</button>
        </form>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(summary.total_invoiced)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{fmt(summary.total_paid)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{fmt(summary.total_outstanding)}</p>
          </div>
        </div>

        {/* Revenue by Month */}
        {Object.keys(summary.by_month || {}).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Month</h3>
            <div className="space-y-2">
              {Object.entries(summary.by_month).map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{month}</span><span className="text-sm font-medium text-foreground">{fmt(amount)}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue by Client */}
        {Object.keys(summary.by_client || {}).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Top Clients by Revenue</h3>
            <div className="space-y-2">
              {Object.entries(summary.by_client).map(([client, amount]) => (
                <div key={client} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{client}</span><span className="text-sm font-medium text-foreground">{fmt(amount)}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issue Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.client?.company || '—'}</td>
                    <td className="px-4 py-3 text-right text-foreground">{fmt(inv.total)}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium capitalize ${STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && <div className="p-8 text-center text-muted-foreground">No invoices for this period.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
