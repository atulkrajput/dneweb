<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function index()
    {
        $apiKeys = ApiKey::latest()->get();

        // Usage statistics
        $totalRequests = $apiKeys->sum('requests_count');
        $activeKeys = $apiKeys->where('is_active', true)->count();
        $totalLeadsViaApi = Lead::where('source', 'api')->count();
        $leadsToday = Lead::where('source', 'api')->whereDate('created_at', today())->count();
        $leadsThisWeek = Lead::where('source', 'api')->where('created_at', '>=', now()->startOfWeek())->count();
        $leadsThisMonth = Lead::where('source', 'api')->where('created_at', '>=', now()->startOfMonth())->count();

        // Per-website stats
        $websiteStats = Lead::where('source', 'api')
            ->selectRaw('source_website, COUNT(*) as leads_count, MAX(created_at) as last_lead_at')
            ->groupBy('source_website')
            ->get();

        return Inertia::render('Admin/ApiKeys/Index', [
            'apiKeys' => $apiKeys,
            'stats' => [
                'totalRequests' => $totalRequests,
                'activeKeys' => $activeKeys,
                'totalKeys' => $apiKeys->count(),
                'totalLeadsViaApi' => $totalLeadsViaApi,
                'leadsToday' => $leadsToday,
                'leadsThisWeek' => $leadsThisWeek,
                'leadsThisMonth' => $leadsThisMonth,
            ],
            'websiteStats' => $websiteStats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'website_name' => 'required|string|max:255',
            'website_url' => 'nullable|string|max:500',
        ]);

        $validated['key'] = ApiKey::generateKey();
        $validated['is_active'] = true;

        ApiKey::create($validated);

        return redirect()->route('admin.api-keys.index')->with('success', 'API key generated successfully.');
    }

    public function toggleStatus(ApiKey $apiKey)
    {
        $apiKey->update(['is_active' => !$apiKey->is_active]);

        $status = $apiKey->is_active ? 'activated' : 'deactivated';

        return redirect()->route('admin.api-keys.index')->with('success', "API key {$status}.");
    }

    public function regenerate(ApiKey $apiKey)
    {
        $apiKey->update([
            'key' => ApiKey::generateKey(),
            'requests_count' => 0,
        ]);

        return redirect()->route('admin.api-keys.index')->with('success', 'API key regenerated. Update the key on your external website.');
    }

    public function destroy(ApiKey $apiKey)
    {
        $apiKey->delete();

        return redirect()->route('admin.api-keys.index')->with('success', 'API key deleted.');
    }
}
