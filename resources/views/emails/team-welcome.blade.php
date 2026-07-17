@extends('emails.layouts.base')

@section('title', 'Welcome to DNE Consultants')

@section('content')
    <h1>Welcome aboard, {{ $user->name }}!</h1>

    <p>
        You've been added as a team member at <strong>DNE Consultants</strong>.
        Your account is ready and you can log in right away.
    </p>

    <hr class="divider">

    <h2>Your Login Details</h2>

    <table class="info-table" role="presentation">
        <tr>
            <td>Email</td>
            <td>{{ $user->email }}</td>
        </tr>
        <tr>
            <td>Password</td>
            <td>{{ $plainPassword }}</td>
        </tr>
        <tr>
            <td>Role</td>
            <td>{{ ucwords(str_replace('_', ' ', $user->team_role)) }}</td>
        </tr>
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $loginUrl }}" class="btn">Log In to Your Account</a>
    </p>

    <hr class="divider">

    <p style="font-size: 13px; color: #6b6b80;">
        For security, we recommend changing your password after your first login.
        If you have any questions, reach out to us at
        <a href="mailto:letsbuild@dneconsultants.com" style="color: #6366f1;">letsbuild@dneconsultants.com</a>.
    </p>
@endsection
