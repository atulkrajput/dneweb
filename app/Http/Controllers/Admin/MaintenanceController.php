<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        $logFile = storage_path('logs/laravel.log');
        $logSize = File::exists($logFile) ? $this->formatBytes(File::size($logFile)) : '0 B';
        $logLastModified = File::exists($logFile) ? date('M d, Y H:i:s', File::lastModified($logFile)) : null;

        // Groq / AI usage summary.
        $aiStats = [
            'total_requests' => (int) AiUsageLog::count(),
            'success_requests' => (int) AiUsageLog::where('status', 'success')->count(),
            'error_requests' => (int) AiUsageLog::where('status', 'error')->count(),
            'total_tokens' => (int) AiUsageLog::sum('total_tokens'),
            'prompt_tokens' => (int) AiUsageLog::sum('prompt_tokens'),
            'completion_tokens' => (int) AiUsageLog::sum('completion_tokens'),
            'tokens_today' => (int) AiUsageLog::whereDate('created_at', now()->toDateString())->sum('total_tokens'),
        ];

        // Paginated request log, most recent first.
        $aiLogs = AiUsageLog::with('user:id,name')
            ->latest()
            ->paginate(20)
            ->through(fn (AiUsageLog $log) => [
                'id' => $log->id,
                'user' => $log->user?->name ?? 'System',
                'kind' => $log->kind,
                'model' => $log->model,
                'status' => $log->status,
                'prompt_tokens' => $log->prompt_tokens,
                'completion_tokens' => $log->completion_tokens,
                'total_tokens' => $log->total_tokens,
                'duration_ms' => $log->duration_ms,
                'error' => $log->error,
                'created_at' => $log->created_at?->format('M d, Y H:i:s'),
            ]);

        return Inertia::render('Admin/Maintenance', [
            'logSize' => $logSize,
            'logLastModified' => $logLastModified,
            'aiStats' => $aiStats,
            'aiLogs' => $aiLogs,
        ]);
    }

    public function clearCache(Request $request)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        return back()->with('success', 'All caches cleared successfully.');
    }

    public function clearLog(Request $request)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        $logFile = storage_path('logs/laravel.log');

        if (File::exists($logFile)) {
            File::put($logFile, '');
        }

        return back()->with('success', 'Error log cleared successfully.');
    }

    public function downloadLog(Request $request)
    {
        if (!$request->user()?->isSuperAdmin()) {
            abort(403);
        }

        $logFile = storage_path('logs/laravel.log');

        if (!File::exists($logFile) || File::size($logFile) === 0) {
            return back()->with('error', 'No log file to download.');
        }

        return response()->download($logFile, 'laravel-' . date('Y-m-d') . '.log');
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes === 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
    }
}
