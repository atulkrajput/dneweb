import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProductivityReport({ tasks, summary, filters }) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);

  const handleFilter = (e) => { e.preventDefault(); router.get('/admin/reports/productivity', { date_from: dateFrom, date_to: dateTo }, { preserveState: true }); };
  const completionRate = summary.total_tasks > 0 ? Math.round((summary.completed / summary.total_tasks) * 100) : 0;

  return (
    <AdminLayout title="Productivity Report">
      <Head title="Productivity Report" />

      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/reports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
          <a href={`/admin/reports/productivity?date_from=${dateFrom}&date_to=${dateTo}&export=csv`} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"><Download className="h-4 w-4" /> Export CSV</a>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-6">
          <div><label className="text-xs text-muted-foreground">From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-input text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-input text-sm" /></div>
          <button type="submit" className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">Apply</button>
        </form>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.total_tasks}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.total_estimated || 0}h</p>
            <p className="text-xs text-muted-foreground">Estimated Hours</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.total_actual || 0}h</p>
            <p className="text-xs text-muted-foreground">Actual Hours</p>
          </div>
        </div>

        {/* By Assignee */}
        {Object.keys(summary.by_assignee || {}).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Team Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left py-2">Team Member</th>
                    <th className="text-center py-2">Tasks</th>
                    <th className="text-center py-2">Done</th>
                    <th className="text-center py-2">Completion</th>
                    <th className="text-center py-2">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(summary.by_assignee).map(([name, data]) => (
                    <tr key={name}>
                      <td className="py-2 text-foreground font-medium">{name}</td>
                      <td className="py-2 text-center text-muted-foreground">{data.total}</td>
                      <td className="py-2 text-center text-green-400">{data.done}</td>
                      <td className="py-2 text-center text-foreground">{data.total > 0 ? Math.round((data.done / data.total) * 100) : 0}%</td>
                      <td className="py-2 text-center text-muted-foreground">{data.hours || 0}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assignee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{t.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.project?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assignee?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{t.status?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{t.actual_hours || 0}h / {t.estimated_hours || 0}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && <div className="p-8 text-center text-muted-foreground">No tasks for this period.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
