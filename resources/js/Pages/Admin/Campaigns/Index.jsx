import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Target, UserCheck, Trophy, TrendingUp, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export default function CampaignsIndex({ stats, topCampaigns, topSources, topLandingPages, topMediums, byDevice, byBrowser, leadsOverTime, filters }) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/campaigns', { date_from: dateFrom, date_to: dateTo }, { preserveState: true });
  };

  const statCards = [
    { label: 'Total Leads', value: stats.total_leads, icon: Target, color: 'text-blue-400' },
    { label: 'Qualified Leads', value: stats.qualified_leads, icon: UserCheck, color: 'text-purple-400' },
    { label: 'Won Clients', value: stats.won_leads, icon: Trophy, color: 'text-green-400' },
    { label: 'Conversion Rate', value: `${stats.conversion_rate}%`, icon: TrendingUp, color: 'text-orange-400' },
  ];

  // Simple bar for visualization
  const BarChart = ({ data, labelKey, valueKey, maxValue }) => {
    const max = maxValue || Math.max(...data.map(d => d[valueKey]), 1);
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-32 truncate flex-shrink-0" title={item[labelKey]}>
              {item[labelKey]}
            </span>
            <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-all"
                style={{ width: `${(item[valueKey] / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground w-10 text-right">{item[valueKey]}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout title="Campaign Analytics">
      <Head title="Campaign Analytics" />

      {/* Date Filter */}
      <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 mb-8">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-input text-sm" />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Apply
        </button>
      </form>

      {/* Stats */}
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

      {/* Leads Over Time */}
      {leadsOverTime.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leads Over Time</h3>
          <div className="flex items-end gap-1 h-32">
            {leadsOverTime.map((day, i) => {
              const max = Math.max(...leadsOverTime.map(d => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-6 bg-card border border-border rounded px-2 py-0.5 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.date}: {day.count} leads
                  </div>
                  <div
                    className="w-full bg-primary/70 rounded-t hover:bg-primary transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{leadsOverTime[0]?.date}</span>
            <span className="text-xs text-muted-foreground">{leadsOverTime[leadsOverTime.length - 1]?.date}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Campaigns */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Campaigns</h3>
          {topCampaigns.length > 0 ? (
            <BarChart data={topCampaigns} labelKey="utm_campaign" valueKey="leads_count" />
          ) : (
            <p className="text-sm text-muted-foreground">No campaign data yet. Leads will appear here when they arrive with UTM parameters.</p>
          )}
        </div>

        {/* Top Sources */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Sources</h3>
          {topSources.length > 0 ? (
            <BarChart data={topSources} labelKey="utm_source" valueKey="leads_count" />
          ) : (
            <p className="text-sm text-muted-foreground">No source data yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Landing Pages */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Landing Pages</h3>
          {topLandingPages.length > 0 ? (
            <div className="space-y-3">
              {topLandingPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate flex-1 mr-4" title={page.landing_url}>
                    <Globe className="inline h-3 w-3 mr-1" />
                    {page.landing_url.replace(/https?:\/\/[^/]+/, '')}
                  </span>
                  <span className="text-sm font-medium text-foreground">{page.leads_count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No landing page data yet.</p>
          )}
        </div>

        {/* Top Mediums */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Mediums</h3>
          {topMediums.length > 0 ? (
            <BarChart data={topMediums} labelKey="utm_medium" valueKey="leads_count" />
          ) : (
            <p className="text-sm text-muted-foreground">No medium data yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Device</h3>
          {byDevice.length > 0 ? (
            <div className="space-y-4">
              {byDevice.map((item, i) => {
                const Icon = DEVICE_ICONS[item.device] || Monitor;
                const total = byDevice.reduce((sum, d) => sum + d.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground capitalize w-20">{item.device}</span>
                    <div className="flex-1 h-4 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">{item.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No device data yet.</p>
          )}
        </div>

        {/* Browser Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Browser</h3>
          {byBrowser.length > 0 ? (
            <BarChart data={byBrowser} labelKey="browser" valueKey="count" />
          ) : (
            <p className="text-sm text-muted-foreground">No browser data yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
