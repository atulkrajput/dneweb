<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskReviewerAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public Task $task) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_reviewer_assigned',
            'title' => 'Task Review Requested',
            'message' => "You were added as reviewer for: {$this->task->title}",
            'task_id' => $this->task->id,
            'url' => "/admin/tasks/{$this->task->id}",
        ];
    }
}
