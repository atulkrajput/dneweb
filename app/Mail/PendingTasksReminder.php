<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class PendingTasksReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $assignee,
        public Collection $tasks,
    ) {}

    public function envelope(): Envelope
    {
        $count = $this->tasks->count();

        return new Envelope(
            subject: "You have {$count} pending " . ($count === 1 ? 'task' : 'tasks'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pending-tasks-reminder',
            with: [
                'assignee' => $this->assignee,
                'tasks' => $this->tasks,
                'boardUrl' => config('app.url') . '/admin/tasks',
            ],
        );
    }
}
