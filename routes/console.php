<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Daily reminder to each assignee about their pending tasks.
Schedule::command('reminders:pending-tasks')->dailyAt('08:00');

// Daily project & sprint update digest for the team.
Schedule::command('digest:projects-sprints')->dailyAt('08:30');

// Existing project deadline reminders (day-before).
Schedule::command('reminders:deadlines')->dailyAt('09:00');

// Monthly performance report, emailed on the 1st for the month just ended.
Schedule::command('reports:monthly-performance')->monthlyOn(1, '08:15');

// Delete website AI chat conversations older than 12 months (Privacy Policy).
Schedule::command('model:prune', ['--model' => [App\Models\ChatConversation::class]])->dailyAt('03:00');
