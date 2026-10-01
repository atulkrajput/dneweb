import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TeamMemberPerformance({ member, current, previous }) {
  // Month navigation rewrites ?month=YYYY-MM for the current (selected) month.
  const shiftMonth = (delta) => {
    const [y, m] = current.month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    router.get(`/admin/team/${member.id}/performance`, { month: next }, { preserveScroll: true, preserveState: true });
  };

  const delta = current.total - previous.total;
  const pctChange = previous.total > 0 ? Math.round((delta / previous.total) * 100) : null;

  const Trend = () => {
    if (delta > 0) return <span className="inline-flex items-center gap-1 text-green-400"><TrendingUp className="h-4 w-4" /> +{delta}</span>;
    if (delta < 0) return <span className="inline-flex items-center gap-1 text-red-400"><TrendingDown className="h-4 w-4" /> {delta}</span>;
    return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="h-4 w-4" /> 0</span>;
  };

  const groupKeys = current.groupKeys || [];
  const types = Object.keys(current.types || {});

  return (
    <AdminLayout title="Team Performance">
      <Head title={`Performance — ${member.name}`} />

      <div className="mb-6">
        <Link href="/admin/team" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Team
        </Link>
      </div>

      {/* Header: member + month nav */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary">{member.name?.[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{member.name}</h2>
              {member.position && <p className="text-sm text-primary">{member.position}</p>}
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 text-muted-foreground hover:text-foreground rounded" title="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[110px] text-center">{current.monthLabel}</span>
            <button onClick={() => shiftMonth(1)} className="p-1.5 text-muted-foreground hover:text-foreground rounded" title="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Totals: current vs previous */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            <Award className="h-4 w-4 text-primary" /> {current.monthLabel}
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{current.total} <span className="text-base font-normal text-muted-foreground">pts</span></p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            {previous.monthLabel}
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{previous.total} <span className="text-base font-normal text-muted-foreground">pts</span></p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-muted-foreground text-xs uppercase tracking-wider">Change</div>
          <p className="text-3xl font-bold mt-2"><Trend /></p>
          {pctChange !== null && (
            <p className="text-xs text-muted-foreground mt-1">{pctChange > 0 ? '+' : ''}{pctChange}% vs last month</p>
          )}
        </div>
      </div>

      {/* Group breakdown comparison */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Breakdown by category</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground">Category</th>
                <th className="py-2 px-3 font-medium text-muted-foreground text-right">{current.monthLabel}</th>
                <th className="py-2 px-3 font-medium text-muted-foreground text-right">{previous.monthLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupKeys.map((g) => (
                <tr key={g} className="hover:bg-muted/30">
                  <td className="py-2 pr-4 text-foreground">{current.groupLabels[g]}</td>
                  <td className="py-2 px-3 text-right text-foreground">{current.groups[g] || 0}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{previous.groups[g] || 0}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-4 text-foreground">Total</td>
                <td className="py-2 px-3 text-right text-foreground">{current.total}</td>
                <td className="py-2 px-3 text-right text-muted-foreground">{previous.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-activity detail for the selected month */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Activity detail — {current.monthLabel}</h3>
        {current.total > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Activity</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Count</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {types
                  .filter((t) => (current.types[t]?.count || 0) > 0)
                  .map((t) => (
                    <tr key={t} className="hover:bg-muted/30">
                      <td className="py-2 pr-4 text-foreground">{current.typeLabels[t] || t}</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">{current.types[t].count}</td>
                      <td className="py-2 px-3 text-right text-foreground">{current.types[t].points}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity recorded for {current.monthLabel}.</p>
        )}
      </div>
    </AdminLayout>
  );
}
