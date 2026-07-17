@extends('emails.layouts.base')

@section('title', 'Reset Your Password')

@section('content')
    <h1>Reset Your Password</h1>

    <p>
        Hi {{ $user->name }},
    </p>

    <p>
        We received a request to reset the password for your DNE Consultants account.
        Click the button below to choose a new password:
    </p>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $url }}" class="btn">Reset Password</a>
    </p>

    <p style="font-size: 14px; color: #4a4a68;">
        This password reset link will expire in <strong>60 minutes</strong>.
    </p>

    <p style="font-size: 14px; color: #4a4a68;">
        If you did not request a password reset, no further action is required. Your account is still secure.
    </p>

    <hr class="divider">

    <p style="font-size: 12px; color: #6b6b80;">
        If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
        <a href="{{ $url }}" style="color: #6366f1; word-break: break-all;">{{ $url }}</a>
    </p>
@endsection
