@extends('emails.layouts.base')

@section('title', 'Thank You for Contacting Us')

@section('content')
    <h1>Thank you, {{ $contact->full_name }}!</h1>

    <p>
        We've received your message and appreciate you reaching out to DNE Consultants.
        Our team will review your inquiry and get back to you within <strong>1 business day</strong>.
    </p>

    <hr class="divider">

    <h2>Here's a summary of your submission:</h2>

    <table class="info-table" role="presentation">
        <tr>
            <td>Name</td>
            <td>{{ $contact->full_name }}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>{{ $contact->email }}</td>
        </tr>
        @if($contact->company)
        <tr>
            <td>Company</td>
            <td>{{ $contact->company }}</td>
        </tr>
        @endif
        <tr>
            <td>Inquiry Type</td>
            <td>{{ ucwords(str_replace('-', ' ', $contact->inquiry_type)) }}</td>
        </tr>
        @if($contact->message)
        <tr>
            <td>Message</td>
            <td>{{ $contact->message }}</td>
        </tr>
        @endif
    </table>

    <hr class="divider">

    <p>
        In the meantime, feel free to explore our services or check out our latest work:
    </p>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ config('app.url') }}/services" class="btn">Explore Our Services</a>
    </p>

    <p style="margin-top: 28px; font-size: 13px; color: #6b6b80;">
        If you have any urgent questions, you can reach us directly at
        <a href="mailto:letsbuild@dneconsultants.com" style="color: #6366f1;">letsbuild@dneconsultants.com</a>.
    </p>
@endsection
