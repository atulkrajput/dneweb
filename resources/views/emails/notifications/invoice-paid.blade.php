@extends('emails.layouts.base')

@section('title', 'Invoice Paid')

@section('content')
    <h1>Invoice paid</h1>

    <p>
        Invoice <strong>{{ $invoice->number }}</strong> has been fully paid.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        <tr>
            <td>Invoice</td>
            <td>{{ $invoice->number }}</td>
        </tr>
        <tr>
            <td>Client</td>
            <td>{{ $invoice->client?->company ?? '—' }}</td>
        </tr>
        <tr>
            <td>Total</td>
            <td>${{ number_format((float) $invoice->total, 2) }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>{{ ucfirst($invoice->status) }}</td>
        </tr>
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $url }}" class="btn">View Invoice</a>
    </p>
@endsection
