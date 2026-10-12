<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectSprintDigest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  User   $recipient
     * @param  array  $projects  Prepared array of project/sprint update data.
     */
    public function __construct(
        public User $recipient,
        public array $projects,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Daily Project & Sprint Update — ' . now()->format('M j, Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-sprint-digest',
            with: [
                'recipient' => $this->recipient,
                'projects' => $this->projects,
                'date' => now()->format('l, F j, Y'),
                'dashboardUrl' => config('app.url') . '/admin/projects',
            ],
        );
    }
}
