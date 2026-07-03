<?php

namespace App\Notifications;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProposalAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(public Proposal $proposal) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'proposal_accepted',
            'title' => 'Proposal Accepted',
            'message' => "Proposal {$this->proposal->number} was accepted.",
            'proposal_id' => $this->proposal->id,
            'url' => "/admin/proposals/{$this->proposal->id}",
        ];
    }
}
