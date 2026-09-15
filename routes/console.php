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
