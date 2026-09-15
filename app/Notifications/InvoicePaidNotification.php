<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoicePaidNotification extends Notification
{
    use Queueable;

    public function __construct(public Invoice $invoice) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'invoice_paid',
            'title' => 'Invoice Paid',
            'message' => "Invoice {$this->invoice->number} has been fully paid (${$this->invoice->total}).",
            'invoice_id' => $this->invoice->id,
            'url' => "/admin/invoices/{$this->invoice->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Invoice Paid: ' . $this->invoice->number)
            ->view('emails.notifications.invoice-paid', [
                'invoice' => $this->invoice,
                'recipient' => $notifiable,
                'url' => config('app.url') . '/admin/invoices/' . $this->invoice->id,
            ]);
    }
}
