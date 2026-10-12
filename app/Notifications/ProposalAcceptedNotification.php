<?php

namespace App\Notifications;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProposalAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(public Proposal $proposal) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
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

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Proposal Accepted: ' . $this->proposal->number)
            ->view('emails.notifications.proposal-accepted', [
                'proposal' => $this->proposal,
                'recipient' => $notifiable,
                'url' => config('app.url') . '/admin/proposals/' . $this->proposal->id,
            ]);
    }
}
