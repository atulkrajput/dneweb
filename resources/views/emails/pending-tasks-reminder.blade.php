@extends('emails.layouts.base')

@section('title', 'Your Pending Tasks')

@section('content')
    <h1>Pending tasks, {{ $assignee->name }}</h1>

    <p>
        Here's a quick summary of the tasks still on your plate.
        You currently have <strong>{{ $tasks->count() }}</strong>
        open {{ $tasks->count() === 1 ? 'task' : 'tasks' }}.
    </p>

    <hr class="divider">

    <table class="info-table" role="presentation">
        <tr>
            <td style="width: auto;">Task</td>
            <td>Project</td>
            <td>Due</td>
        </tr>
        @foreach ($tasks as $task)
            <tr>
                <td style="width: auto; font-weight: 600;">
                    {{ $task->title }}
                    <span style="display:block; font-weight:400; color:#9999aa; font-size:12px;">
                        {{ ucwords(str_replace('_', ' ', $task->status)) }} · {{ ucfirst($task->priority) }} priority
                    </span>
                </td>
                <td>{{ $task->project?->name ?? '—' }}</td>
                <td style="color: {{ $task->due_date && $task->due_date->isPast() ? '#dc2626' : '#4a4a68' }};">
                    {{ $task->due_date ? $task->due_date->format('M j') : '—' }}
                    @if ($task->due_date && $task->due_date->isPast())
                        <span style="display:block; font-size:12px;">Overdue</span>
                    @endif
                </td>
            </tr>
        @endforeach
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $boardUrl }}" class="btn">Open Task Board</a>
    </p>
@endsection
