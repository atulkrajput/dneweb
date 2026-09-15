@extends('emails.layouts.base')

@section('title', 'Deadline Tomorrow')

@section('content')
    <h1>Deadline tomorrow</h1>

    <p>
        Heads up — the deadline for project <strong>{{ $project->name }}</strong> is tomorrow.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        <tr>
            <td>Project</td>
            <td>{{ $project->name }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>{{ ucwords(str_replace('_', ' ', $project->status)) }}</td>
        </tr>
        <tr>
            <td>Progress</td>
            <td>{{ (int) $project->progress }}%</td>
        </tr>
        @if ($project->deadline)
        <tr>
            <td>Deadline</td>
            <td>{{ $project->deadline->format('M j, Y') }}</td>
        </tr>
        @endif
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $url }}" class="btn">View Project</a>
    </p>
@endsection
