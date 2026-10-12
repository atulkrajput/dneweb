<?php

namespace App\Notifications;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLeadNotification extends Notification
{
    use Queueable;

    public function __construct(public Lead $lead) {}

    public function via(object $notifiable): array
    {
        // Everyone gets the in-app bell; only super admins also get an email.
        $channels = ['database'];

        if ($notifiable instanceof User && $notifiable->isSuperAdmin()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_lead',
            'title' => 'New Lead',
            'message' => "{$this->lead->name} submitted a contact form.",
            'lead_id' => $this->lead->id,
            'url' => "/admin/leads/{$this->lead->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Lead: ' . ($this->lead->name ?: 'Unknown'))
            ->view('emails.notifications.new-lead', [
                'lead' => $this->lead,
                'recipient' => $notifiable,
                'url' => config('app.url') . '/admin/leads/' . $this->lead->id,
            ]);
    }
}
