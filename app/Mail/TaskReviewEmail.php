<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskReviewEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Task $task,
        public User $reviewer,
        public bool $isReminder = false,
    ) {}

    public function envelope(): Envelope
    {
        $prefix = $this->isReminder ? 'Reminder: Review Task' : 'Review Requested';

        return new Envelope(
            subject: $prefix . ': ' . $this->task->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.task-review',
            with: [
                'task' => $this->task,
                'reviewer' => $this->reviewer,
                'isReminder' => $this->isReminder,
                'taskUrl' => config('app.url') . '/admin/tasks/' . $this->task->id,
            ],
        );
    }
}
