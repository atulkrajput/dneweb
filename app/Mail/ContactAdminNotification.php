<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Contact $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Form Submission — ' . $this->contact->full_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-admin-notification',
            with: [
                'contact' => $this->contact,
            ],
        );
    }
}
