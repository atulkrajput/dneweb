<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewLeadNotification extends Notification
{
    use Queueable;

    public function __construct(public Lead $lead) {}

    public function via(object $notifiable): array
    {
        return ['database'];
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
}
