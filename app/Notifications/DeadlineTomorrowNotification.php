<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeadlineTomorrowNotification extends Notification
{
    use Queueable;

    public function __construct(public Project $project) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'deadline_tomorrow',
            'title' => 'Deadline Tomorrow',
            'message' => "Project \"{$this->project->name}\" deadline is tomorrow.",
            'project_id' => $this->project->id,
            'url' => "/admin/projects/{$this->project->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Deadline Tomorrow: ' . $this->project->name)
            ->view('emails.notifications.deadline-tomorrow', [
                'project' => $this->project,
                'recipient' => $notifiable,
                'url' => config('app.url') . '/admin/projects/' . $this->project->id,
            ]);
    }
}
