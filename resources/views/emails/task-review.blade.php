@extends('emails.layouts.base')

@section('title', $isReminder ? 'Review Reminder' : 'Review Requested')

@section('content')
    @if ($isReminder)
        <h1>Friendly reminder, {{ $reviewer->name }}</h1>
        <p>
            This task is still waiting for your review on <strong>DNE Consultants</strong>.
        </p>
    @else
        <h1>You've been asked to review a task, {{ $reviewer->name }}</h1>
        <p>
            You were added as the reviewer for a task on <strong>DNE Consultants</strong>.
            Here are the details.
        </p>
    @endif

    <hr class="divider">

    <h2>{{ $task->title }}</h2>

    <table class="info-table" role="presentation">
        <tr>
            <td>Project</td>
            <td>{{ $task->project?->name ?? '—' }}</td>
        </tr>
        <tr>
            <td>Assignee</td>
            <td>{{ $task->assignee?->name ?? 'Unassigned' }}</td>
        </tr>
        @if ($task->sprint)
        <tr>
            <td>Sprint</td>
            <td>{{ $task->sprint->name }}</td>
        </tr>
        @endif
        <tr>
            <td>Priority</td>
            <td>{{ ucfirst($task->priority) }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>{{ ucwords(str_replace('_', ' ', $task->status)) }}</td>
        </tr>
        <tr>
            <td>Due Date</td>
            <td>{{ $task->due_date ? $task->due_date->format('M j, Y') : 'No due date' }}</td>
        </tr>
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $taskUrl }}" class="btn">Review Task</a>
    </p>
@endsection
