@extends('emails.layouts.base')

@section('title', 'New Contact Form Submission')

@section('content')
    <h1>New Contact Form Submission</h1>

    <p>
        A new inquiry has been submitted through the website contact form.
        Here are the details:
    </p>

    <table class="info-table" role="presentation">
        <tr>
            <td>Name</td>
            <td>{{ $contact->full_name }}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td><a href="mailto:{{ $contact->email }}" style="color: #6366f1;">{{ $contact->email }}</a></td>
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
        <tr>
            <td>Submitted At</td>
            <td>{{ $contact->created_at->format('M d, Y \a\t h:i A') }}</td>
        </tr>
    </table>

    <hr class="divider">

    <p>
        <strong>Action required:</strong> Please review and respond to this lead within 1 business day.
    </p>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ config('app.url') }}/admin/leads" class="btn">View in Admin Panel</a>
    </p>
@endsection
