<?php

namespace App\Console\Commands;

use App\Mail\PendingTasksReminder;
use App\Models\Task;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPendingTaskReminders extends Command
{
    protected $signature = 'reminders:pending-tasks';
    protected $description = 'Send each assignee a daily reminder of their pending (not done) tasks';

    public function handle(): int
    {
        // Pending = any task not yet done that has an assignee.
        $tasks = Task::with(['project:id,name', 'assignee:id,name,email'])
            ->whereNotNull('assignee_id')
            ->where('status', '!=', Task::STATUS_DONE)
            ->orderBy('due_date')
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('No pending tasks to remind about.');
            return self::SUCCESS;
        }

        // Group by assignee so each person gets a single digest.
        $grouped = $tasks->groupBy('assignee_id');

        $sent = 0;

        foreach ($grouped as $assigneeId => $assigneeTasks) {
            $assignee = $assigneeTasks->first()->assignee;

            if (!$assignee || !$assignee->email) {
                continue;
            }

            try {
                Mail::to($assignee->email)->send(new PendingTasksReminder($assignee, $assigneeTasks));
                $this->info("Reminder sent to {$assignee->name} ({$assigneeTasks->count()} tasks).");
                $sent++;
            } catch (\Exception $e) {
                Log::error('Failed to send pending task reminder: ' . $e->getMessage());
                $this->error("Failed for {$assignee->email}: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sent} pending-task reminder(s).");
        return self::SUCCESS;
    }
}
