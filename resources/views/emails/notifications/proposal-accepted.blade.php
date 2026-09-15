@extends('emails.layouts.base')

@section('title', 'Proposal Accepted')

@section('content')
    <h1>Proposal accepted</h1>

    <p>
        Great news — proposal <strong>{{ $proposal->number }}</strong> has been accepted.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        <tr>
            <td>Proposal</td>
            <td>{{ $proposal->number }}</td>
        </tr>
        @if ($proposal->title)
        <tr>
            <td>Title</td>
            <td>{{ $proposal->title }}</td>
        </tr>
        @endif
        <tr>
            <td>Value</td>
            <td>${{ number_format((float) $proposal->total, 2) }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>{{ ucfirst($proposal->status) }}</td>
        </tr>
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $url }}" class="btn">View Proposal</a>
    </p>
@endsection
