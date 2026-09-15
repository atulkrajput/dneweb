@extends('emails.layouts.base')

@section('title', 'New Lead')

@section('content')
    <h1>New lead received</h1>

    <p>
        A new lead just came in. Here are the details.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        <tr>
            <td>Name</td>
            <td>{{ $lead->name ?: '—' }}</td>
        </tr>
        @if ($lead->company)
        <tr>
            <td>Company</td>
            <td>{{ $lead->company }}</td>
        </tr>
        @endif
        <tr>
            <td>Email</td>
            <td>{{ $lead->email ?: '—' }}</td>
        </tr>
        @if ($lead->phone)
        <tr>
            <td>Phone</td>
            <td>{{ $lead->phone }}</td>
        </tr>
        @endif
        @if ($lead->interested_service)
        <tr>
            <td>Interested In</td>
            <td>{{ $lead->interested_service }}</td>
        </tr>
        @endif
        <tr>
            <td>Source</td>
            <td>{{ $lead->source ? ucwords(str_replace('_', ' ', $lead->source)) : '—' }}</td>
        </tr>
    </table>

    @if ($lead->notes)
        <p style="margin-top: 20px;">{{ $lead->notes }}</p>
    @endif

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $url }}" class="btn">View Lead</a>
    </p>
@endsection
