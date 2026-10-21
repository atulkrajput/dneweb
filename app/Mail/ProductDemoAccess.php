<?php

namespace App\Mail;

use App\Models\Product;
use App\Models\ProductInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to a visitor who requested a product demo: the demo link and test
 * login are no longer public, so this email is how they get access.
 */
class ProductDemoAccess extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Product $product, public ProductInterest $interest) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Your {$this->product->name} demo access");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.product-demo-access');
    }
}
