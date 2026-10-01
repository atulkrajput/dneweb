@extends('emails.layouts.base')

@section('title', 'Your Performance Report')

@section('content')
    @php
        $delta = $current['total'] - $previous['total'];
        $trend = $delta > 0 ? "▲ +{$delta}" : ($delta < 0 ? "▼ {$delta}" : '— 0');
        $trendColor = $delta > 0 ? '#16a34a' : ($delta < 0 ? '#dc2626' : '#6b6b80');
    @endphp

    <h1>Nice work, {{ $recipient->name }}</h1>

    <p>
        Here is your performance summary for <strong>{{ $current['monthLabel'] }}</strong> on
        <strong>DNE Consultants</strong>.
    </p>

    <table class="info-table" role="presentation">
        <tr>
            <td>{{ $current['monthLabel'] }}</td>
            <td><strong>{{ $current['total'] }} points</strong></td>
        </tr>
        <tr>
            <td>{{ $previous['monthLabel'] }}</td>
            <td>{{ $previous['total'] }} points</td>
        </tr>
        <tr>
            <td>Change</td>
            <td style="color: {{ $trendColor }}; font-weight: 600;">{{ $trend }}</td>
        </tr>
    </table>

    <hr class="divider">

    <h2>Breakdown by category</h2>

    <table class="info-table" role="presentation">
        @foreach ($current['groupKeys'] as $g)
            @php $cur = $current['groups'][$g] ?? 0; $prev = $previous['groups'][$g] ?? 0; @endphp
            @if ($cur > 0 || $prev > 0)
                <tr>
                    <td>{{ $current['groupLabels'][$g] ?? ucfirst($g) }}</td>
                    <td>{{ $cur }} pts <span style="color:#9999aa;">(prev {{ $prev }})</span></td>
                </tr>
            @endif
        @endforeach
    </table>

    <p style="text-align: center; margin: 32px 0;">
        <a href="{{ $dashboardUrl }}" class="btn">View Dashboard</a>
    </p>

    <p style="font-size: 13px; color: #9999aa;">
        Points are awarded for activity across tasks, leads, projects, sales, and content.
        Keep it up!
    </p>
@endsection
