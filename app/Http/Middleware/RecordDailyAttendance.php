<?php

namespace App\Http\Middleware;

use App\Models\Activity;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Credit daily attendance on the first admin page a person opens each day.
 *
 * Sessions now last all day (and "Remember me" keeps people signed in), so
 * attendance can't depend on the login form any more. The session remembers
 * the day already credited, so this costs one query per person per day.
 */
class RecordDailyAttendance
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $request->hasSession()) {
            $today = now()->toDateString();

            if ($request->session()->get('attendance_recorded_on') !== $today) {
                Activity::logDailyLogin($user->id);
                $request->session()->put('attendance_recorded_on', $today);
            }
        }

        return $next($request);
    }
}
