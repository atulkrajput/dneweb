<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Project;
use App\Models\Service;
use App\Models\Task;
use App\Models\TeamMember;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Pipeline value = total of proposals/leads in negotiation/proposal_sent stages
        $pipelineValue = Lead::whereIn('status', ['qualified', 'proposal_sent', 'negotiation'])->count();

        // Monthly revenue (current month)
        $monthlyRevenue = Invoice::status('paid')
            ->whereMonth('issue_date', now()->month)
            ->whereYear('issue_date', now()->year)
            ->sum('total');

        // Pending invoices (sent + overdue)
        $pendingInvoices = Invoice::unpaid()->sum('total');

        // Tasks due today or overdue
        $tasksDue = Task::where(function ($q) {
            $q->where('due_date', '<=', now()->toDateString())
              ->where('status', '!=', 'done');
        })->count();

        // Lead funnel
        $leadFunnel = Lead::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Conversion rate (won / total non-new)
        $totalProcessed = Lead::whereNotIn('status', ['new'])->count();
        $wonCount = Lead::status('won')->count();
        $conversionRate = $totalProcessed > 0 ? round(($wonCount / $totalProcessed) * 100, 1) : 0;

        // Revenue chart (last 6 months)
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenueChart[] = [
                'month' => $date->format('M'),
                'revenue' => (float) Invoice::status('paid')
                    ->whereMonth('issue_date', $date->month)
                    ->whereYear('issue_date', $date->year)
                    ->sum('total'),
            ];
        }

        // Recent activity (from lead_activities)
        $recentActivity = LeadActivity::with(['lead:id,name', 'user:id,name'])
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_leads' => Lead::count(),
                'new_leads' => Lead::status('new')->count(),
                'active_clients' => Client::active()->count(),
                'active_projects' => Project::active()->count(),
                'tasks_due' => $tasksDue,
                'monthly_revenue' => $monthlyRevenue,
                'pending_invoices' => $pendingInvoices,
                'conversion_rate' => $conversionRate,
                'pipeline_leads' => $pipelineValue,
                'overdue_projects' => Project::overdue()->count(),
            ],
            'leadFunnel' => $leadFunnel,
            'revenueChart' => $revenueChart,
            'recentActivity' => $recentActivity,
            'recent_leads' => Lead::latest()->take(5)->get(),
        ]);
    }
}
