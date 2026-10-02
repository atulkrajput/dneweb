<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PerformanceService
{
    /**
     * Build the monthly performance report.
     *
     * @param  Carbon  $month   Any date within the target month.
     * @param  User    $viewer  The user viewing the report (controls scope).
     * @return array{month:string, rows:array, groups:array, types:array}
     */
    public function monthlyReport(Carbon $month, User $viewer): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $groups = config('performance.groups', []);
        $labels = config('performance.labels', []);
        $types = array_keys(config('performance.points', []));

        // Which users are in scope: super admins see the whole team, everyone
        // else sees only themselves.
        $usersQuery = User::query()->select('id', 'name', 'team_role', 'photo');
        if (!$viewer->isSuperAdmin()) {
            $usersQuery->where('id', $viewer->id);
        } else {
            $usersQuery->where('is_active', true);
        }
        $users = $usersQuery->orderBy('name')->get();

        // Pull aggregated activity for the month, per user + type.
        $activityQuery = Activity::query()
            ->selectRaw('user_id, type, COUNT(*) as cnt, SUM(points) as pts')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('user_id', 'type');

        if (!$viewer->isSuperAdmin()) {
            $activityQuery->where('user_id', $viewer->id);
        }

        $agg = $activityQuery->get();

        // Index aggregation by user then type for quick lookup.
        $byUser = [];
        foreach ($agg as $row) {
            $byUser[$row->user_id][$row->type] = [
                'count' => (int) $row->cnt,
                'points' => (int) $row->pts,
            ];
        }

        $rows = $users->map(function (User $user) use ($byUser, $types, $groups) {
            $userTypes = $byUser[$user->id] ?? [];

            // Per-type counts and points.
            $typeStats = [];
            $total = 0;
            foreach ($types as $type) {
                $count = $userTypes[$type]['count'] ?? 0;
                $points = $userTypes[$type]['points'] ?? 0;
                $typeStats[$type] = ['count' => $count, 'points' => $points];
                $total += $points;
            }

            // Per-group point subtotals for the table columns.
            $groupPoints = [];
            foreach ($groups as $groupKey => $groupTypes) {
                $sum = 0;
                foreach ($groupTypes as $t) {
                    $sum += $typeStats[$t]['points'] ?? 0;
                }
                $groupPoints[$groupKey] = $sum;
            }

            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'role' => $user->team_role,
                'photo' => $user->photo,
                'types' => $typeStats,
                'groups' => $groupPoints,
                'total' => $total,
            ];
        })
        ->sortByDesc('total')
        ->values()
        ->all();

        return [
            'month' => $start->format('Y-m'),
            'monthLabel' => $start->format('F Y'),
            'rows' => $rows,
            'groups' => array_keys($groups),
            'groupLabels' => $this->groupLabels(array_keys($groups)),
            'types' => $types,
            'typeLabels' => $labels,
        ];
    }

    /**
     * Build a single user's performance breakdown for a given month.
     * Unscoped by viewer — intended for admin per-member views and reports.
     *
     * @return array{
     *   month:string, monthLabel:string, total:int,
     *   types:array<string,array{count:int,points:int}>,
     *   groups:array<string,int>, groupKeys:array, groupLabels:array,
     *   typeLabels:array
     * }
     */
    public function monthlyReportForUser(Carbon $month, User $user): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        return $this->reportForUserBetween($start, $end, $user);
    }

    /**
     * Build a single user's performance breakdown for an explicit date range.
     * Used for fair month-to-date comparisons (e.g. this month so far vs the
     * same number of days last month).
     *
     * @return array{
     *   month:string, monthLabel:string, rangeLabel:string, days:int, total:int,
     *   types:array<string,array{count:int,points:int}>,
     *   groups:array<string,int>, groupKeys:array, groupLabels:array,
     *   typeLabels:array
     * }
     */
    public function reportForUserBetween(Carbon $start, Carbon $end, User $user): array
    {
        $start = $start->copy()->startOfDay();
        $end = $end->copy()->endOfDay();

        $groups = config('performance.groups', []);
        $labels = config('performance.labels', []);
        $types = array_keys(config('performance.points', []));

        $agg = Activity::query()
            ->selectRaw('type, COUNT(*) as cnt, SUM(points) as pts')
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $typeStats = [];
        $total = 0;
        foreach ($types as $type) {
            $count = (int) ($agg[$type]->cnt ?? 0);
            $points = (int) ($agg[$type]->pts ?? 0);
            $typeStats[$type] = ['count' => $count, 'points' => $points];
            $total += $points;
        }

        $groupPoints = [];
        foreach ($groups as $groupKey => $groupTypes) {
            $sum = 0;
            foreach ($groupTypes as $t) {
                $sum += $typeStats[$t]['points'] ?? 0;
            }
            $groupPoints[$groupKey] = $sum;
        }

        // Inclusive day span of the range.
        $days = $start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1;

        $sameMonth = $start->isSameMonth($end);
        $rangeLabel = $sameMonth
            ? $start->format('M j') . '–' . $end->format('j')
            : $start->format('M j') . ' – ' . $end->format('M j');

        return [
            'month' => $start->format('Y-m'),
            'monthLabel' => $start->format('F Y'),
            'rangeLabel' => $rangeLabel,
            'days' => $days,
            'total' => $total,
            'types' => $typeStats,
            'groups' => $groupPoints,
            'groupKeys' => array_keys($groups),
            'groupLabels' => $this->groupLabels(array_keys($groups)),
            'typeLabels' => $labels,
        ];
    }

    /**
     * Friendly labels for the group column headers.
     */
    protected function groupLabels(array $groupKeys): array
    {
        $map = [
            'attendance' => 'Attendance',
            'tasks' => 'Tasks',
            'leads' => 'Leads',
            'projects' => 'Projects',
            'sales' => 'Sales',
            'content' => 'Content',
        ];

        $out = [];
        foreach ($groupKeys as $key) {
            $out[$key] = $map[$key] ?? ucfirst($key);
        }

        return $out;
    }
}
