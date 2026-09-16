<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\LeadActivity;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Console\Command;

class BackfillPerformanceActivities extends Command
{
    protected $signature = 'performance:backfill {--fresh : Delete existing backfilled activities first}';

    protected $description = 'Best-effort backfill of performance activities from existing task comments and lead activities.';

    public function handle(): int
    {
        if ($this->option('fresh')) {
            Activity::whereJsonContains('properties->backfilled', true)->delete();
            $this->warn('Removed previously backfilled activities.');
        }

        $closed = $this->backfillTaskClosures();
        $reviewed = $this->backfillTaskReviews();
        $converted = $this->backfillLeadConversions();

        $this->info("Backfill complete: {$closed} task closures, {$reviewed} task reviews, {$converted} lead conversions.");

        return self::SUCCESS;
    }

    /**
     * Reconstruct task_closed activities from "Moved to Done" transition comments.
     */
    protected function backfillTaskClosures(): int
    {
        $points = (int) config('performance.points.task_closed', 0);
        $count = 0;

        TaskComment::where('body', 'like', 'Moved to Done%')
            ->whereNotNull('user_id')
            ->chunkById(200, function ($comments) use ($points, &$count) {
                foreach ($comments as $comment) {
                    Activity::create([
                        'user_id' => $comment->user_id,
                        'type' => 'task_closed',
                        'points' => $points,
                        'subject_type' => (new Task)->getMorphClass(),
                        'subject_id' => $comment->task_id,
                        'properties' => ['backfilled' => true],
                        'created_at' => $comment->created_at,
                        'updated_at' => $comment->created_at,
                    ]);
                    $count++;
                }
            });

        return $count;
    }

    /**
     * Credit reviewers for tasks that reached Done and have a reviewer set.
     */
    protected function backfillTaskReviews(): int
    {
        $points = (int) config('performance.points.task_reviewed', 0);
        $count = 0;

        Task::whereNotNull('reviewer_id')
            ->where('status', 'done')
            ->chunkById(200, function ($tasks) use ($points, &$count) {
                foreach ($tasks as $task) {
                    Activity::create([
                        'user_id' => $task->reviewer_id,
                        'type' => 'task_reviewed',
                        'points' => $points,
                        'subject_type' => $task->getMorphClass(),
                        'subject_id' => $task->id,
                        'properties' => ['backfilled' => true],
                        'created_at' => $task->updated_at,
                        'updated_at' => $task->updated_at,
                    ]);
                    $count++;
                }
            });

        return $count;
    }

    /**
     * Reconstruct lead_converted activities from lead_activities of type 'converted'.
     */
    protected function backfillLeadConversions(): int
    {
        $points = (int) config('performance.points.lead_converted', 0);
        $count = 0;

        LeadActivity::where('type', 'converted')
            ->whereNotNull('user_id')
            ->chunkById(200, function ($rows) use ($points, &$count) {
                foreach ($rows as $row) {
                    Activity::create([
                        'user_id' => $row->user_id,
                        'type' => 'lead_converted',
                        'points' => $points,
                        'subject_type' => \App\Models\Lead::class,
                        'subject_id' => $row->lead_id,
                        'properties' => ['backfilled' => true],
                        'created_at' => $row->created_at,
                        'updated_at' => $row->created_at,
                    ]);
                    $count++;
                }
            });

        return $count;
    }
}
