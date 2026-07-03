<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Notifications\DeadlineTomorrowNotification;
use Illuminate\Console\Command;

class SendDeadlineReminders extends Command
{
    protected $signature = 'reminders:deadlines';
    protected $description = 'Send notifications for projects with deadline tomorrow';

    public function handle(): int
    {
        $tomorrow = now()->addDay()->toDateString();

        $projects = Project::where('deadline', $tomorrow)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->get();

        if ($projects->isEmpty()) {
            $this->info('No projects with deadline tomorrow.');
            return 0;
        }

        $users = User::all();

        foreach ($projects as $project) {
            $users->each(fn ($user) => $user->notify(new DeadlineTomorrowNotification($project)));
            $this->info("Reminded: {$project->name}");
        }

        $this->info("Sent deadline reminders for {$projects->count()} project(s).");
        return 0;
    }
}
