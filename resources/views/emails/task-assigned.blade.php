@extends('emails.layouts.base')

@section('title', 'New Task Assigned')

@section('content')
    <h1>You've got a new task, {{ $assignee->name }}</h1>

    <p>
        A task has been assigned to you on <strong>DNE Consultants</strong>.
        Here are the details.
    </p>

    <hr class="divider">

    <h2>{{ $task->title }}</h2>

    <table class="info-table" role="presentation">
        <tr>
            <td>Project</td>
            <td>{{ $task->project?->name ?? '—' }}</td>
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

    @if ($task->description)
        <p style="margin-top: 20px;">{{ $task->description }}</p>
    @endif

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $taskUrl }}" class="btn">View Task</a>
    </p>
@endsection
