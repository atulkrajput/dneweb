<?php

namespace App\Mail;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class ProposalEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Proposal $proposal) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Proposal {$this->proposal->number} — {$this->proposal->title}",
        );
    }

    public function content(): Content
    {
        // Generate a signed URL valid for 30 days
        $acceptUrl = URL::signedRoute('proposal.public.accept', [
            'proposal' => $this->proposal->id,
        ]);

        return new Content(
            view: 'emails.proposal',
            with: [
                'proposal' => $this->proposal,
                'acceptUrl' => $acceptUrl,
            ],
        );
    }
}
