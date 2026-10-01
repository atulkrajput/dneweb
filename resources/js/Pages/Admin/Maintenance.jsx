import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Trash2, RefreshCw, Download, HardDrive, FileText, Sparkles, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

const KIND_LABELS = {
  task_title: 'Task Title',
  task_description: 'Task Description',
  task_checklist: 'Task Checklist',
  project_description: 'Project Description',
  sprint_goal: 'Sprint Goal',
};

const num = (n) => (n ?? 0).toLocaleString();

export default function Maintenance({ logSize, logLastModified, aiStats, aiLogs }) {
  const [processing, setProcessing] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('maintenance');

  const handleClearCache = () => {
    setProcessing('cache');
    router.post('/admin/maintenance/clear-cache', {}, {
      onFinish: () => setProcessing(null),
    });
  };

  const handleClearLog = () => {
    if (!confirm('Are you sure you want to clear the error log? This action cannot be undone.')) return;
    setProcessing('log');
    router.post('/admin/maintenance/clear-log', {}, {
      onFinish: () => setProcessing(null),
    });
  };

  const goToPage = (url) => {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  const tabs = [
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'ai', label: 'Groq API Usage' },
  ];

  return (
    <AdminLayout title="Maintenance">
      <Head title="Maintenance" />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Page Description */}
          <p className="text-sm text-muted-foreground">System maintenance tools for cache and log management.</p>

          {/* Cache Management */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <HardDrive className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Clear Cache</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Clears application config, route, view, and general cache. Use this after making changes to environment variables or config files on the server.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleClearCache}
                    disabled={processing === 'cache'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${processing === 'cache' ? 'animate-spin' : ''}`} />
                    {processing === 'cache' ? 'Clearing...' : 'Clear All Cache'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Log Management */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Error Log</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage the application error log file. Large log files can impact server performance.
                </p>

                {/* Log Info */}
                <div className="mt-4 bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">File size:</span>{' '}
                      <span className="font-medium text-foreground">{logSize}</span>
                    </div>
                    {logLastModified && (
                      <div>
                        <span className="text-muted-foreground">Last modified:</span>{' '}
                        <span className="font-medium text-foreground">{logLastModified}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleClearLog}
                    disabled={processing === 'log'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className={`h-4 w-4 ${processing === 'log' ? 'animate-spin' : ''}`} />
                    {processing === 'log' ? 'Clearing...' : 'Clear Error Log'}
                  </button>

                  <a
                    href="/admin/maintenance/download-log"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Log
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            All Groq API requests made from this application, with token consumption.
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <Cpu className="h-4 w-4" /> Total Tokens
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{num(aiStats?.total_tokens)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {num(aiStats?.prompt_tokens)} prompt + {num(aiStats?.completion_tokens)} completion
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Total Requests
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{num(aiStats?.total_requests)}</p>
              <p className="text-xs text-muted-foreground mt-1">Tokens today: {num(aiStats?.tokens_today)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Successful
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{num(aiStats?.success_requests)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <AlertCircle className="h-4 w-4 text-red-500" /> Errors
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{num(aiStats?.error_requests)}</p>
            </div>
          </div>

          {/* Request log table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Prompt</th>
                    <th className="px-4 py-3 font-medium text-right">Completion</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(aiLogs?.data || []).map((log) => (
                    <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{log.created_at}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">{log.user}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground">{KIND_LABELS[log.kind] || log.kind}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{log.model || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                            success
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400"
                            title={log.error || ''}
                          >
                            error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{num(log.prompt_tokens)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{num(log.completion_tokens)}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{num(log.total_tokens)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {log.duration_ms != null ? `${num(log.duration_ms)} ms` : '—'}
                      </td>
                    </tr>
                  ))}
                  {(!aiLogs?.data || aiLogs.data.length === 0) && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        No Groq API requests recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {aiLogs?.links && aiLogs.links.length > 3 && (
              <div className="flex flex-wrap items-center justify-center gap-1 p-4 border-t border-border">
                {aiLogs.links.map((link, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!link.url}
                    onClick={() => goToPage(link.url)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      link.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
