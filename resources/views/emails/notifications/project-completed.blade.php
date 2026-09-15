@extends('emails.layouts.base')

@section('title', 'Project Completed')

@section('content')
    <h1>Project completed</h1>

    <p>
        Project <strong>{{ $project->name }}</strong> has been marked as completed.
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
