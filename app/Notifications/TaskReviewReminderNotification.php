<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskReviewReminderNotification extends Notification
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
            'type' => 'task_review_reminder',
            'title' => 'Review Reminder',
            'message' => "Reminder to review: {$this->task->title}",
            'task_id' => $this->task->id,
            'url' => "/admin/tasks/{$this->task->id}",
        ];
    }
}
