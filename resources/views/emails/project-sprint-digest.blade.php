@extends('emails.layouts.base')

@section('title', 'Daily Project & Sprint Update')

@section('content')
    <h1>Daily update, {{ $recipient->name }}</h1>

    <p>
        Here's where your active projects and sprints stand as of {{ $date }}.
    </p>

    @foreach ($projects as $project)
        <hr class="divider">

        <h2>{{ $project['name'] }}</h2>

        <table class="info-table" role="presentation">
            <tr>
                <td>Status</td>
                <td>{{ ucwords(str_replace('_', ' ', $project['status'])) }}</td>
            </tr>
            <tr>
                <td>Progress</td>
                <td>{{ $project['progress'] }}%</td>
            </tr>
            <tr>
                <td>Deadline</td>
                <td style="color: {{ $project['overdue'] ? '#dc2626' : '#4a4a68' }};">
                    {{ $project['deadline'] ?? '—' }}
                    @if ($project['overdue'])
                        (Overdue)
                    @endif
                </td>
            </tr>
            <tr>
                <td>Tasks</td>
                <td>{{ $project['done_tasks'] }} done · {{ $project['pending_tasks'] }} pending</td>
            </tr>
        </table>

        @if (!empty($project['sprints']))
            <p style="font-weight:600; margin: 16px 0 4px;">Sprints</p>
            <table class="info-table" role="presentation">
                <tr>
                    <td style="width:auto;">Sprint</td>
                    <td>Status</td>
                    <td>Progress</td>
                </tr>
                @foreach ($project['sprints'] as $sprint)
                    <tr>
                        <td style="width:auto; font-weight:600;">
                            {{ $sprint['name'] }}
                            @if ($sprint['overdue'])
                                <span style="display:block; font-weight:400; color:#dc2626; font-size:12px;">Overdue</span>
                            @endif
                        </td>
                        <td>{{ ucfirst($sprint['status']) }}</td>
                        <td>{{ $sprint['progress'] }}%</td>
                    </tr>
                @endforeach
            </table>
        @endif
    @endforeach

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $dashboardUrl }}" class="btn">Open Projects</a>
    </p>
@endsection
