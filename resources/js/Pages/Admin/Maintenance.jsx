import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Trash2, RefreshCw, Download, HardDrive, FileText } from 'lucide-react';

export default function Maintenance({ logSize, logLastModified }) {
  const [processing, setProcessing] = React.useState(null);

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

  return (
    <AdminLayout title="Maintenance">
      <Head title="Maintenance" />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">System maintenance tools for cache and log management.</p>
        </div>

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
    </AdminLayout>
  );
}
