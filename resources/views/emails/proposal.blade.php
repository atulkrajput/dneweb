@extends('emails.layouts.base')

@section('title', 'Proposal ' . $proposal->number)

@section('content')
    <h1>Your Proposal is Ready</h1>

    <p>
        Hi {{ $proposal->lead?->name ?? $proposal->client?->company ?? 'there' }},
    </p>

    <p>
        We're excited to share our proposal for <strong>{{ $proposal->title }}</strong>.
        Below is a summary of what we've put together for you.
    </p>

    <hr class="divider">

    <h2>Proposal Summary</h2>

    <table class="info-table" role="presentation">
        <tr>
            <td>Proposal #</td>
            <td>{{ $proposal->number }}</td>
        </tr>
        <tr>
            <td>Project</td>
            <td>{{ $proposal->title }}</td>
        </tr>
        @if($proposal->timeline)
        <tr>
            <td>Timeline</td>
            <td>{{ $proposal->timeline }}</td>
        </tr>
        @endif
        @if($proposal->valid_until)
        <tr>
            <td>Valid Until</td>
            <td>{{ $proposal->valid_until->format('M d, Y') }}</td>
        </tr>
        @endif
    </table>

    @if($proposal->services && count($proposal->services) > 0)
    <h2 style="margin-top: 24px;">Services Included</h2>
    <ul style="padding-left: 20px; color: #4a4a68; font-size: 14px;">
        @foreach($proposal->services as $service)
        <li style="margin-bottom: 6px;">{{ ucwords(str_replace('-', ' ', $service)) }}</li>
        @endforeach
    </ul>
    @endif

    @if($proposal->deliverables && count($proposal->deliverables) > 0)
    <h2 style="margin-top: 24px;">Deliverables</h2>
    <ul style="padding-left: 20px; color: #4a4a68; font-size: 14px;">
        @foreach($proposal->deliverables as $deliverable)
        <li style="margin-bottom: 6px;">{{ $deliverable }}</li>
        @endforeach
    </ul>
    @endif

    @if($proposal->pricing && count($proposal->pricing) > 0)
    <h2 style="margin-top: 24px;">Pricing</h2>
    <table class="info-table" role="presentation">
        @foreach($proposal->pricing as $item)
        <tr>
            <td>{{ $item['description'] }}</td>
            <td style="text-align: right;">${{ number_format($item['amount'], 2) }}</td>
        </tr>
        @endforeach
        <tr style="border-top: 2px solid #1a1a2e;">
            <td><strong>Total</strong></td>
            <td style="text-align: right;"><strong>${{ number_format($proposal->total, 2) }}</strong></td>
        </tr>
    </table>
    @endif

    @if($proposal->terms)
    <hr class="divider">
    <h2>Terms & Conditions</h2>
    <p style="font-size: 13px; color: #4a4a68; white-space: pre-wrap;">{{ $proposal->terms }}</p>
    @endif

    <hr class="divider">

    <p>
        If you're happy with this proposal, you can accept it directly by clicking the button below:
    </p>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $acceptUrl }}" class="btn" style="background-color: #16a34a;">Accept Proposal</a>
    </p>

    <p>
        Have questions or want to discuss further? Just reply to this email or reach out to us directly.
    </p>

    <p style="text-align: center; margin-top: 16px;">
        <a href="mailto:letsbuild@dneconsultants.com" class="btn" style="background-color: #6366f1;">Let's Discuss</a>
    </p>

    <p style="margin-top: 28px; font-size: 13px; color: #6b6b80;">
        This proposal is valid until {{ $proposal->valid_until ? $proposal->valid_until->format('M d, Y') : '30 days from the date of this email' }}.
    </p>
@endsection
