import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Target, Building2, FolderKanban, DollarSign, TrendingUp, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

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
  new: 'bg-blue-500/10 text-blue-400',
  contacted: 'bg-yellow-500/10 text-yellow-400',
  qualified: 'bg-purple-500/10 text-purple-400',
  proposal_sent: 'bg-orange-500/10 text-orange-400',
  negotiation: 'bg-cyan-500/10 text-cyan-400',
  won: 'bg-green-500/10 text-green-400',
  lost: 'bg-red-500/10 text-red-400',
};

const FUNNEL_COLORS = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-purple-500',
  proposal_sent: 'bg-orange-500',
  negotiation: 'bg-cyan-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
};

const ACTIVITY_ICONS = {
  created: '🆕',
  updated: '✏️',
  status_changed: '🔄',
  proposal_sent: '📄',
  converted: '🎉',
};

export default function Dashboard({ stats, leadFunnel, revenueChart, recentActivity, recent_leads }) {
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const cards = [
    { label: 'New Leads Today', value: stats.new_leads, icon: Target, color: 'text-blue-400', href: '/admin/leads?status=new' },
    { label: 'Pipeline', value: stats.pipeline_leads + ' leads', icon: TrendingUp, color: 'text-purple-400', href: '/admin/leads' },
    { label: 'Monthly Revenue', value: fmt(stats.monthly_revenue), icon: DollarSign, color: 'text-green-400', href: '/admin/invoices?status=paid' },
    { label: 'Active Projects', value: stats.active_projects, icon: FolderKanban, color: 'text-orange-400', href: '/admin/projects' },
    { label: 'Tasks Due', value: stats.tasks_due, icon: CheckSquare, color: stats.tasks_due > 0 ? 'text-red-400' : 'text-muted-foreground', href: '/admin/tasks' },
    { label: 'Pending Invoices', value: fmt(stats.pending_invoices), icon: Clock, color: 'text-yellow-400', href: '/admin/invoices?status=sent' },
    { label: 'Active Clients', value: stats.active_clients, icon: Building2, color: 'text-cyan-400', href: '/admin/clients' },
    { label: 'Conversion Rate', value: stats.conversion_rate + '%', icon: TrendingUp, color: 'text-green-400', href: '/admin/campaigns' },
  ];

  // Revenue chart max for scaling
  const maxRevenue = Math.max(...revenueChart.map(r => r.revenue), 1);

  // Funnel total
  const funnelTotal = Object.values(leadFunnel).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <AdminLayout title="Dashboard">
      <Head title="Admin Dashboard" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`h-6 w-6 ${card.color}`} />
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Revenue (Last 6 Months)</h2>
            <Link href="/admin/invoices" className="text-xs text-primary hover:text-primary/80">View Invoices →</Link>
          </div>
          <div className="flex items-end gap-2 h-40">
            {revenueChart.map((item, i) => {
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-6 bg-card border border-border rounded px-2 py-0.5 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {fmt(item.revenue)}
                    </div>
                  </div>
                  <div className="w-full flex justify-center">
                    <div
                      className="w-full max-w-[40px] bg-primary/70 rounded-t hover:bg-primary transition-colors"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Lead Funnel</h2>
            <Link href="/admin/leads" className="text-xs text-primary hover:text-primary/80">View All →</Link>
          </div>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = leadFunnel[status] || 0;
              const pct = (count / funnelTotal) * 100;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium text-foreground">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${FUNNEL_COLORS[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Leads</h2>
            <Link href="/admin/leads" className="text-xs text-primary hover:text-primary/80">View All →</Link>
          </div>
          {recent_leads && recent_leads.length > 0 ? (
            <div className="space-y-3">
              {recent_leads.map((lead) => (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email} • {lead.company || 'No company'}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2">
                  <span className="text-base mt-0.5">{ACTIVITY_ICONS[activity.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.lead && <>{activity.lead.name} • </>}
                      {activity.user?.name || 'System'} • {new Date(activity.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
