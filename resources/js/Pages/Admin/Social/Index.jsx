import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Share2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Save } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const labelize = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const num = (n) => (n == null ? '—' : Number(n).toLocaleString());

function Delta({ cur, prev }) {
  if (prev == null || cur == null) return <span className="text-muted-foreground">—</span>;
  const d = cur - prev;
  const pct = prev !== 0 ? Math.round((d / prev) * 100) : null;
  if (d > 0) return <span className="text-green-400 inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{num(d)}{pct != null ? ` (+${pct}%)` : ''}</span>;
  if (d < 0) return <span className="text-red-400 inline-flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {num(d)}{pct != null ? ` (${pct}%)` : ''}</span>;
  return <span className="text-muted-foreground inline-flex items-center gap-1"><Minus className="h-3 w-3" /> 0</span>;
}

function PlatformCard({ platform, data, currentPeriod, goals }) {
  // Seed the form from existing current-month values, plus the suggested metric keys.
  const existingMetrics = data.current?.metrics || {};
  const keys = Array.from(new Set([...(data.suggested || []), ...Object.keys(existingMetrics)]));

  const initialMetrics = {};
  keys.forEach((k) => { initialMetrics[k] = existingMetrics[k] ?? ''; });

  const form = useForm({
    period: currentPeriod,
    platform,
    posts_published: data.current?.posts_published ?? '',
    metrics: initialMetrics,
    goal_id: '',
    notes: data.current?.notes ?? '',
  });

  const [editing, setEditing] = useState(false);

  const setMetric = (key, value) => {
    form.setData('metrics', { ...form.data.metrics, [key]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    form.post('/admin/social', { preserveScroll: true, onSuccess: () => setEditing(false) });
  };

  const curPosts = data.current?.posts_published ?? null;
  const prevPosts = data.previous?.posts_published ?? null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" /> {data.label}
        </h3>
        <button onClick={() => setEditing(!editing)} className="text-xs text-primary hover:underline">
          {editing ? 'Cancel' : (data.current ? 'Edit' : 'Enter data')}
        </button>
      </div>

      {!editing ? (
        <div>
          {/* Comparison table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-1.5 pr-2 font-medium">Metric</th>
                <th className="py-1.5 px-2 font-medium text-right">This month</th>
                <th className="py-1.5 px-2 font-medium text-right">Last month</th>
                <th className="py-1.5 pl-2 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-1.5 pr-2 text-foreground">Posts published</td>
                <td className="py-1.5 px-2 text-right text-foreground">{num(curPosts)}</td>
                <td className="py-1.5 px-2 text-right text-muted-foreground">{num(prevPosts)}</td>
                <td className="py-1.5 pl-2 text-right"><Delta cur={curPosts} prev={prevPosts} /></td>
              </tr>
              {Array.from(new Set([
                ...Object.keys(data.current?.metrics || {}),
                ...Object.keys(data.previous?.metrics || {}),
              ])).map((key) => {
                const cur = data.current?.metrics?.[key];
                const prev = data.previous?.metrics?.[key];
                return (
                  <tr key={key}>
                    <td className="py-1.5 pr-2 text-foreground">{labelize(key)}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{num(cur)}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{num(prev)}</td>
                    <td className="py-1.5 pl-2 text-right"><Delta cur={cur} prev={prev} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Per-post efficiency (impressions/views per post) */}
          {curPosts > 0 && (data.current?.metrics?.impressions != null || data.current?.metrics?.views != null) && (
            <p className="text-xs text-muted-foreground mt-3">
              {data.current?.metrics?.impressions != null && (
                <>Impressions/post: <span className="text-foreground">{(data.current.metrics.impressions / curPosts).toFixed(1)}</span>{' '}</>
              )}
              {data.current?.metrics?.views != null && (
                <>· Views/post: <span className="text-foreground">{(data.current.metrics.views / curPosts).toFixed(1)}</span></>
              )}
            </p>
          )}

          {!data.current && <p className="text-xs text-muted-foreground mt-2">No data entered for this month.</p>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Posts published</label>
            <input type="number" min="0" value={form.data.posts_published} onChange={(e) => form.setData('posts_published', e.target.value)} className="form-input text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {keys.map((key) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground">{labelize(key)}</label>
                <input type="number" step="any" value={form.data.metrics[key] ?? ''} onChange={(e) => setMetric(key, e.target.value)} className="form-input text-sm" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Linked goal</label>
              <select value={form.data.goal_id} onChange={(e) => form.setData('goal_id', e.target.value)} className="form-input text-sm">
                <option value="">None</option>
                {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <input type="text" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="form-input text-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {form.processing ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SocialIndex({ currentPeriod, currentLabel, previousLabel, platforms, platformKeys, goals }) {
  const shiftMonth = (delta) => {
    const [y, m] = currentPeriod.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    router.get('/admin/social', { month: next }, { preserveScroll: true, preserveState: true });
  };

  return (
    <AdminLayout title="Social Media">
      <Head title="Social Media Metrics" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Monthly social metrics per platform. Posts published is effort; impressions, clicks and visits are the impact that counts.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.post('/admin/social/log-daily-post', {}, { preserveScroll: true })}
            className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors"
            title="Logs today's social posting as effort (once per day)"
          >
            Log today's posting
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 text-muted-foreground hover:text-foreground rounded"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-medium text-foreground min-w-[110px] text-center">{currentLabel}</span>
            <button onClick={() => shiftMonth(1)} className="p-1.5 text-muted-foreground hover:text-foreground rounded"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Comparing <strong>{currentLabel}</strong> vs <strong>{previousLabel}</strong>.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {platformKeys.map((p) => (
          <PlatformCard key={p} platform={p} data={platforms[p]} currentPeriod={currentPeriod} goals={goals} />
        ))}
      </div>
    </AdminLayout>
  );
}
