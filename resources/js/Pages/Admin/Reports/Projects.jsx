import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = { planning: 'Planning', in_progress: 'In Progress', review: 'Review', testing: 'Testing', completed: 'Completed', on_hold: 'On Hold', cancelled: 'Cancelled' };

export default function ProjectsReport({ projects, summary }) {
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <AdminLayout title="Projects Report">
      <Head title="Projects Report" />

      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/reports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
          <a href="/admin/reports/projects?export=csv" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"><Download className="h-4 w-4" /> Export CSV</a>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{fmt(summary.total_budget)}</p>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.avg_progress}%</p>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{summary.overdue}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{summary.by_status?.completed || 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* By Status */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">By Status</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(summary.by_status || {}).map(([status, count]) => (
              <div key={status} className="px-3 py-2 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground font-medium capitalize">{STATUS_LABELS[status] || status}</span>
                <span className="text-xs text-muted-foreground ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.client?.company || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{p.status?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right text-foreground">{p.budget ? fmt(p.budget) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} /></div><span className="text-xs text-muted-foreground">{p.progress}%</span></div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {projects.length === 0 && <div className="p-8 text-center text-muted-foreground">No projects found.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
