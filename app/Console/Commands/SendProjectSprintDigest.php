<?php

namespace App\Console\Commands;

use App\Mail\ProjectSprintDigest;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendProjectSprintDigest extends Command
{
    protected $signature = 'digest:projects-sprints';
    protected $description = 'Send a daily digest of active project and sprint updates to the team';

    public function handle(): int
    {
        $projects = Project::active()
            ->with(['sprints', 'tasks:id,project_id,status'])
            ->orderBy('name')
            ->get();

        if ($projects->isEmpty()) {
            $this->info('No active projects to report.');
            return self::SUCCESS;
        }

        $projectData = $projects->map(function (Project $project) {
            $doneTasks = $project->tasks->where('status', Task::STATUS_DONE)->count();
            $pendingTasks = $project->tasks->count() - $doneTasks;

            $sprints = $project->sprints
                ->whereIn('status', ['planning', 'active'])
                ->map(fn ($sprint) => [
                    'name' => $sprint->name,
                    'status' => $sprint->status,
                    'progress' => $sprint->progress(),
                    'overdue' => $sprint->end_date ? $sprint->isOverdue() : false,
                ])
                ->values()
                ->all();

            return [
                'name' => $project->name,
                'status' => $project->status,
                'progress' => (int) $project->progress,
                'deadline' => $project->deadline?->format('M j, Y'),
                'overdue' => $project->deadline
                    ? ($project->deadline->isPast() && !in_array($project->status, [Project::STATUS_COMPLETED, Project::STATUS_CANCELLED]))
                    : false,
                'done_tasks' => $doneTasks,
                'pending_tasks' => $pendingTasks,
                'sprints' => $sprints,
            ];
        })->all();

        // Recipients: active team members who can access the projects module.
        $recipients = User::active()
            ->whereIn('team_role', [
                User::ROLE_SUPER_ADMIN,
                User::ROLE_PROJECT_MANAGER,
                User::ROLE_DEVELOPER,
            ])
            ->get();

        if ($recipients->isEmpty()) {
            $this->info('No recipients for the digest.');
            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($recipients as $recipient) {
            if (!$recipient->email) {
                continue;
            }

            try {
                Mail::to($recipient->email)->send(new ProjectSprintDigest($recipient, $projectData));
                $sent++;
            } catch (\Exception $e) {
                Log::error('Failed to send project/sprint digest: ' . $e->getMessage());
                $this->error("Failed for {$recipient->email}: {$e->getMessage()}");
            }
        }

        $this->info("Sent daily digest to {$sent} recipient(s) covering {$projects->count()} project(s).");
        return self::SUCCESS;
    }
}
