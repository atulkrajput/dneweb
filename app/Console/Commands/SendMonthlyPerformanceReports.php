<?php

namespace App\Console\Commands;

use App\Mail\MonthlyPerformanceReport;
use App\Models\User;
use App\Services\PerformanceService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMonthlyPerformanceReports extends Command
{
    protected $signature = 'reports:monthly-performance
        {--month= : Target month as YYYY-MM (defaults to the previous month)}
        {--dry-run : List who would receive a report without sending emails}';

    protected $description = 'Email a monthly performance report to each active employee who earned more than 0 points';

    public function handle(PerformanceService $performance): int
    {
        // Default to the previous month so it can run on the 1st for the month just ended.
        $monthOption = $this->option('month');
        try {
            $month = $monthOption
                ? Carbon::createFromFormat('Y-m', $monthOption)->startOfMonth()
                : now()->startOfMonth()->subMonth();
        } catch (\Throwable $e) {
            $this->error('Invalid --month. Use YYYY-MM.');
            return self::FAILURE;
        }

        $previous = $month->copy()->subMonth();
        $dryRun = (bool) $this->option('dry-run');

        $users = User::active()->whereNotNull('email')->orderBy('name')->get();

        $sent = 0;
        $skipped = 0;

        foreach ($users as $user) {
            $current = $performance->monthlyReportForUser($month, $user);

            // Only employees with more than 0 points get a report.
            if ($current['total'] <= 0) {
                $skipped++;
                continue;
            }

            $previousReport = $performance->monthlyReportForUser($previous, $user);

            if ($dryRun) {
                $this->line(sprintf('%s — %d pts (%s)', $user->name, $current['total'], $user->email));
                $sent++;
                continue;
            }

            try {
                Mail::to($user->email)->send(new MonthlyPerformanceReport($user, $current, $previousReport));
                $sent++;
            } catch (\Throwable $e) {
                Log::error('Failed to send monthly performance report: ' . $e->getMessage());
                $this->error("Failed for {$user->email}: {$e->getMessage()}");
            }
        }

        $verb = $dryRun ? 'Would send' : 'Sent';
        $this->info("{$verb} {$month->format('F Y')} performance reports to {$sent} employee(s); skipped {$skipped} with 0 points.");

        return self::SUCCESS;
    }
}
