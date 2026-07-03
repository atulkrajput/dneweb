<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        $query = Lead::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        // Overview stats
        $totalLeads = (clone $query)->count();
        $qualifiedLeads = (clone $query)->whereIn('status', ['qualified', 'proposal_sent', 'negotiation', 'won'])->count();
        $wonLeads = (clone $query)->where('status', 'won')->count();
        $conversionRate = $totalLeads > 0 ? round(($wonLeads / $totalLeads) * 100, 1) : 0;

        // Top campaigns
        $topCampaigns = (clone $query)
            ->whereNotNull('utm_campaign')
            ->where('utm_campaign', '!=', '')
            ->select('utm_campaign', DB::raw('COUNT(*) as leads_count'), DB::raw('SUM(CASE WHEN status = "won" THEN 1 ELSE 0 END) as won_count'))
            ->groupBy('utm_campaign')
            ->orderByDesc('leads_count')
            ->limit(10)
            ->get();

        // Top sources
        $topSources = (clone $query)
            ->whereNotNull('utm_source')
            ->where('utm_source', '!=', '')
            ->select('utm_source', DB::raw('COUNT(*) as leads_count'), DB::raw('SUM(CASE WHEN status = "won" THEN 1 ELSE 0 END) as won_count'))
            ->groupBy('utm_source')
            ->orderByDesc('leads_count')
            ->limit(10)
            ->get();

        // Top landing pages
        $topLandingPages = (clone $query)
            ->whereNotNull('landing_url')
            ->where('landing_url', '!=', '')
            ->select('landing_url', DB::raw('COUNT(*) as leads_count'))
            ->groupBy('landing_url')
            ->orderByDesc('leads_count')
            ->limit(10)
            ->get();

        // Leads by device
        $byDevice = (clone $query)
            ->whereNotNull('device')
            ->where('device', '!=', '')
            ->select('device', DB::raw('COUNT(*) as count'))
            ->groupBy('device')
            ->get();

        // Leads by browser
        $byBrowser = (clone $query)
            ->whereNotNull('browser')
            ->where('browser', '!=', '')
            ->select('browser', DB::raw('COUNT(*) as count'))
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        // Leads over time (daily)
        $leadsOverTime = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top mediums
        $topMediums = (clone $query)
            ->whereNotNull('utm_medium')
            ->where('utm_medium', '!=', '')
            ->select('utm_medium', DB::raw('COUNT(*) as leads_count'))
            ->groupBy('utm_medium')
            ->orderByDesc('leads_count')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Campaigns/Index', [
            'stats' => [
                'total_leads' => $totalLeads,
                'qualified_leads' => $qualifiedLeads,
                'won_leads' => $wonLeads,
                'conversion_rate' => $conversionRate,
            ],
            'topCampaigns' => $topCampaigns,
            'topSources' => $topSources,
            'topLandingPages' => $topLandingPages,
            'topMediums' => $topMediums,
            'byDevice' => $byDevice,
            'byBrowser' => $byBrowser,
            'leadsOverTime' => $leadsOverTime,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
