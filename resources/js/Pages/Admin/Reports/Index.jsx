import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Target, DollarSign, FolderKanban, Users, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const reports = [
  { key: 'leads', name: 'Leads Report', description: 'Lead acquisition, status breakdown, and sources', href: '/admin/reports/leads', icon: Target, color: 'text-blue-400', metricLabel: 'New leads' },
  { key: 'revenue', name: 'Revenue Report', description: 'Invoiced amounts, payments, and revenue by client', href: '/admin/reports/revenue', icon: DollarSign, color: 'text-green-400', metricLabel: 'Paid revenue' },
  { key: 'projects', name: 'Projects Report', description: 'Project statuses, budgets, progress, and deadlines', href: '/admin/reports/projects', icon: FolderKanban, color: 'text-orange-400', metricLabel: 'New projects' },
  { key: 'productivity', name: 'Productivity Report', description: 'Task completion, hours logged, and team performance', href: '/admin/reports/productivity', icon: Users, color: 'text-purple-400', metricLabel: 'Tasks completed' },
];

const fmtMoney = (val) => '$' + Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

function formatValue(stat) {
  if (!stat) return '—';
  return stat.is_currency ? fmtMoney(stat.current) : Number(stat.current || 0).toLocaleString();
}

function formatPrev(stat) {
  if (!stat) return '—';
  return stat.is_currency ? fmtMoney(stat.previous) : Number(stat.previous || 0).toLocaleString();
}

function ChangeBadge({ change }) {
  if (change === null || change === undefined) {
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" /> n/a</span>;
  }
  const up = change >= 0;
  const Icon = change === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const color = change === 0 ? 'text-muted-foreground' : up ? 'text-green-400' : 'text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" /> {up && change !== 0 ? '+' : ''}{change}%
    </span>
  );
}

export default function ReportsIndex({ summary }) {
  return (
    <AdminLayout title="Reports">
      <Head title="Reports" />

      {summary && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing <span className="text-foreground font-medium">{summary.monthLabel}</span> vs <span className="text-foreground font-medium">{summary.prevMonthLabel}</span>. Click a report for full details.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
        {reports.map((report) => {
          const stat = summary?.[report.key];
          return (
            <Link
              key={report.name}
              href={report.href}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <report.icon className={`h-10 w-10 ${report.color}`} />
                {stat && <ChangeBadge change={stat.change} />}
              </div>

              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{report.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>

              {stat && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{report.metricLabel} · {summary.monthLabel}</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">{formatValue(stat)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{summary.prevMonthLabel}</p>
                    <p className="text-xl font-bold text-muted-foreground mt-0.5">{formatPrev(stat)}</p>
                  </div>

                  {/* Secondary context line per report */}
                  {report.key === 'revenue' && stat.outstanding > 0 && (
                    <p className="col-span-2 text-xs text-amber-500">{fmtMoney(stat.outstanding)} outstanding</p>
                  )}
                  {report.key === 'projects' && (
                    <p className="col-span-2 text-xs text-muted-foreground">{stat.active} active right now</p>
                  )}
                </div>
              )}

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                View full report <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}
