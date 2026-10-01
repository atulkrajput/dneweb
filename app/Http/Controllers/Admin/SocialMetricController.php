<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Goal;
use App\Models\SocialMetric;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SocialMetricController extends Controller
{
    public function index(Request $request)
    {
        // Selected month (YYYY-MM), defaulting to the current month.
        $monthParam = $request->input('month');
        try {
            $current = $monthParam
                ? Carbon::createFromFormat('Y-m', $monthParam)->startOfMonth()
                : now()->startOfMonth();
        } catch (\Throwable $e) {
            $current = now()->startOfMonth();
        }
        $previous = $current->copy()->subMonth();

        $currentPeriod = $current->format('Y-m');
        $previousPeriod = $previous->format('Y-m');

        $rows = SocialMetric::whereIn('period', [$currentPeriod, $previousPeriod])->get();

        $byPlatform = [];
        foreach (SocialMetric::PLATFORMS as $platform) {
            $cur = $rows->first(fn ($r) => $r->period === $currentPeriod && $r->platform === $platform);
            $prev = $rows->first(fn ($r) => $r->period === $previousPeriod && $r->platform === $platform);

            $byPlatform[$platform] = [
                'label' => SocialMetric::PLATFORM_LABELS[$platform],
                'suggested' => SocialMetric::SUGGESTED_METRICS[$platform] ?? [],
                'current' => $cur ? [
                    'id' => $cur->id,
                    'posts_published' => $cur->posts_published,
                    'metrics' => $cur->metrics ?? [],
                    'notes' => $cur->notes,
                ] : null,
                'previous' => $prev ? [
                    'posts_published' => $prev->posts_published,
                    'metrics' => $prev->metrics ?? [],
                ] : null,
            ];
        }

        return Inertia::render('Admin/Social/Index', [
            'currentPeriod' => $currentPeriod,
            'currentLabel' => $current->format('F Y'),
            'previousPeriod' => $previousPeriod,
            'previousLabel' => $previous->format('F Y'),
            'platforms' => $byPlatform,
            'platformKeys' => SocialMetric::PLATFORMS,
            'goals' => Goal::active()->ordered()->get(['id', 'title']),
        ]);
    }

    /**
     * Upsert the metrics for one platform for one month.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'period' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'platform' => 'required|string|in:' . implode(',', SocialMetric::PLATFORMS),
            'posts_published' => 'nullable|integer|min:0',
            'metrics' => 'nullable|array',
            'metrics.*' => 'nullable|numeric',
            'goal_id' => 'nullable|exists:goals,id',
            'notes' => 'nullable|string|max:2000',
        ]);

        // Drop empty/blank metric values so we only store what was entered.
        $metrics = [];
        foreach (($validated['metrics'] ?? []) as $key => $value) {
            if ($value !== null && $value !== '') {
                $metrics[$key] = (float) $value;
            }
        }

        SocialMetric::updateOrCreate(
            ['period' => $validated['period'], 'platform' => $validated['platform']],
            [
                'posts_published' => $validated['posts_published'] ?? 0,
                'metrics' => $metrics,
                'goal_id' => $validated['goal_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return back()->with('success', SocialMetric::PLATFORM_LABELS[$validated['platform']] . ' metrics saved.');
    }

    /**
     * Log today's social posting as effort for the current user (once per day).
     * Non-reviewable, low effort points — explicitly NOT business impact.
     */
    public function logDailyPost(Request $request)
    {
        $logged = Activity::logDailySocialPost((int) $request->user()->id);

        return back()->with('success', $logged
            ? "Today's social posting logged."
            : "Today's social posting was already logged.");
    }
}
