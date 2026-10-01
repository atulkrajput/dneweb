<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MonthlyPerformanceReport extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  User   $recipient
     * @param  array  $current   PerformanceService::monthlyReportForUser() for the reported month.
     * @param  array  $previous  Same, for the month before.
     */
    public function __construct(
        public User $recipient,
        public array $current,
        public array $previous,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Performance Report — ' . $this->current['monthLabel'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.monthly-performance-report',
            with: [
                'recipient' => $this->recipient,
                'current' => $this->current,
                'previous' => $this->previous,
                'dashboardUrl' => config('app.url') . '/admin',
            ],
        );
    }
}
