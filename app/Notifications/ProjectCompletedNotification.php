<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectCompletedNotification extends Notification
{
    use Queueable;

    public function __construct(public Project $project) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project_completed',
            'title' => 'Project Completed',
            'message' => "Project \"{$this->project->name}\" has been marked as completed.",
            'project_id' => $this->project->id,
            'url' => "/admin/projects/{$this->project->id}",
        ];
    }
}
