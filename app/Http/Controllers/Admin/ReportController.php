<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    /**
     * Leads Report
     */
    public function leads(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonths(3)->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        $query = Lead::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        $data = (clone $query)->select(
            'id', 'name', 'company', 'email', 'phone', 'country',
            'interested_service', 'status', 'utm_source', 'utm_campaign', 'created_at'
        )->latest()->get();

        $summary = [
            'total' => (clone $query)->count(),
            'by_status' => (clone $query)->select('status', DB::raw('COUNT(*) as count'))->groupBy('status')->pluck('count', 'status'),
            'by_source' => (clone $query)->whereNotNull('utm_source')->where('utm_source', '!=', '')->select('utm_source', DB::raw('COUNT(*) as count'))->groupBy('utm_source')->orderByDesc('count')->limit(5)->pluck('count', 'utm_source'),
        ];

        if ($request->input('export') === 'csv') {
            return $this->exportCsv('leads_report', $data->toArray(), ['ID', 'Name', 'Company', 'Email', 'Phone', 'Country', 'Service', 'Status', 'Source', 'Campaign', 'Created']);
        }

        return Inertia::render('Admin/Reports/Leads', [
            'data' => $data,
            'summary' => $summary,
            'filters' => ['date_from' => $dateFrom, 'date_to' => $dateTo],
        ]);
    }

    /**
     * Revenue Report
     */
    public function revenue(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonths(6)->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        $invoices = Invoice::with('client:id,company')
            ->whereBetween('issue_date', [$dateFrom, $dateTo])
            ->orderBy('issue_date', 'desc')
            ->get();

        $summary = [
            'total_invoiced' => $invoices->sum('total'),
            'total_paid' => $invoices->where('status', 'paid')->sum('total'),
            'total_outstanding' => $invoices->whereIn('status', ['sent', 'overdue'])->sum('total'),
            'by_month' => $invoices->where('status', 'paid')->groupBy(fn ($i) => $i->issue_date->format('Y-m'))->map(fn ($group) => $group->sum('total')),
            'by_client' => $invoices->where('status', 'paid')->groupBy(fn ($i) => $i->client?->company ?? 'Unknown')->map(fn ($group) => $group->sum('total'))->sortDesc()->take(10),
        ];

        if ($request->input('export') === 'csv') {
            $rows = $invoices->map(fn ($i) => [
                'number' => $i->number,
                'client' => $i->client?->company,
                'total' => $i->total,
                'status' => $i->status,
                'issue_date' => $i->issue_date->toDateString(),
                'due_date' => $i->due_date->toDateString(),
            ])->toArray();
            return $this->exportCsv('revenue_report', $rows, ['Invoice', 'Client', 'Total', 'Status', 'Issue Date', 'Due Date']);
        }

        return Inertia::render('Admin/Reports/Revenue', [
            'invoices' => $invoices,
            'summary' => $summary,
            'filters' => ['date_from' => $dateFrom, 'date_to' => $dateTo],
        ]);
    }

    /**
     * Projects Report
     */
    public function projects(Request $request)
    {
        $projects = Project::with('client:id,company')->get();

        $summary = [
            'total' => $projects->count(),
            'by_status' => $projects->groupBy('status')->map->count(),
            'total_budget' => $projects->sum('budget'),
            'avg_progress' => round($projects->avg('progress'), 1),
            'overdue' => $projects->filter(fn ($p) => $p->deadline && $p->deadline->isPast() && !in_array($p->status, ['completed', 'cancelled']))->count(),
        ];

        if ($request->input('export') === 'csv') {
            $rows = $projects->map(fn ($p) => [
                'name' => $p->name,
                'client' => $p->client?->company,
                'status' => $p->status,
                'priority' => $p->priority,
                'budget' => $p->budget,
                'progress' => $p->progress . '%',
                'start_date' => $p->start_date?->toDateString(),
                'deadline' => $p->deadline?->toDateString(),
            ])->toArray();
            return $this->exportCsv('projects_report', $rows, ['Project', 'Client', 'Status', 'Priority', 'Budget', 'Progress', 'Start Date', 'Deadline']);
        }

        return Inertia::render('Admin/Reports/Projects', [
            'projects' => $projects,
            'summary' => $summary,
        ]);
    }

    /**
     * Productivity Report (Tasks)
     */
    public function productivity(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subMonths(1)->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        $tasks = Task::with(['assignee:id,name', 'project:id,name'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->get();

        $summary = [
            'total_tasks' => $tasks->count(),
            'completed' => $tasks->where('status', 'done')->count(),
            'total_estimated' => $tasks->sum('estimated_hours'),
            'total_actual' => $tasks->sum('actual_hours'),
            'by_assignee' => $tasks->groupBy(fn ($t) => $t->assignee?->name ?? 'Unassigned')->map(fn ($group) => [
                'total' => $group->count(),
                'done' => $group->where('status', 'done')->count(),
                'hours' => $group->sum('actual_hours'),
            ]),
            'by_status' => $tasks->groupBy('status')->map->count(),
        ];

        if ($request->input('export') === 'csv') {
            $rows = $tasks->map(fn ($t) => [
                'title' => $t->title,
                'project' => $t->project?->name,
                'assignee' => $t->assignee?->name ?? 'Unassigned',
                'status' => $t->status,
                'priority' => $t->priority,
                'estimated_hours' => $t->estimated_hours,
                'actual_hours' => $t->actual_hours,
                'due_date' => $t->due_date?->toDateString(),
            ])->toArray();
            return $this->exportCsv('productivity_report', $rows, ['Task', 'Project', 'Assignee', 'Status', 'Priority', 'Est. Hours', 'Actual Hours', 'Due Date']);
        }

        return Inertia::render('Admin/Reports/Productivity', [
            'tasks' => $tasks,
            'summary' => $summary,
            'filters' => ['date_from' => $dateFrom, 'date_to' => $dateTo],
        ]);
    }

    /**
     * Export data as CSV download.
     */
    private function exportCsv(string $filename, array $rows, array $headers): StreamedResponse
    {
        $filename = $filename . '_' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($rows, $headers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, array_values(is_array($row) ? $row : (array) $row));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
