<?php

namespace App\Console\Commands;

use App\Mail\ContactAdminNotification;
use App\Mail\ContactThankYou;
use App\Models\Contact;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestContactEmail extends Command
{
    protected $signature = 'mail:test-contact {email}';
    protected $description = 'Send a test contact form email to the given address';

    public function handle(): int
    {
        $email = $this->argument('email');

        $contact = new Contact([
            'full_name' => 'Atul Test',
            'email' => $email,
            'company' => 'DNE Consultants',
            'inquiry_type' => 'ai-automation',
            'message' => 'This is a test contact form submission to verify email templates.',
        ]);
        $contact->id = 1;
        $contact->created_at = now();

        $this->info("Sending thank-you email to {$email}...");
        Mail::to($email)->send(new ContactThankYou($contact));
        $this->info('✓ Thank you email sent!');

        $this->info('Sending admin notification to letsbuild@dneconsultants.com...');
        Mail::to('letsbuild@dneconsultants.com')->send(new ContactAdminNotification($contact));
        $this->info('✓ Admin notification email sent!');

        $this->info('All emails sent successfully.');

        return Command::SUCCESS;
    }
}
