@extends('emails.layouts.base')

@section('title', 'Your ' . $product->name . ' demo access')

@section('content')
    <h1>Hi {{ $interest->name }},</h1>

    <p>
        Thanks for your interest in <strong>{{ $product->name }}</strong>. Here are your demo details.
        Explore at your own pace — our team will also be in touch within <strong>1 business day</strong>
        to answer questions and walk you through it.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        @if($product->demo_link)
        <tr>
            <td>Demo link</td>
            <td><a href="{{ $product->demo_link }}">{{ $product->demo_link }}</a></td>
        </tr>
        @endif
        @if($product->demo_credentials)
        <tr>
            <td>Login details</td>
            <td style="white-space: pre-wrap; font-family: monospace;">{{ $product->demo_credentials }}</td>
        </tr>
        @endif
    </table>

    <hr class="divider">

    <p>
        This is a shared demo account with sample data, so please don't enter real or personal information.
        Questions? Just reply to this email.
    </p>
@endsection
