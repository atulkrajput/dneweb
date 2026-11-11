<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyAttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_staying_signed_in_still_earns_attendance_once_per_day(): void
    {
        $user = User::factory()->create(['team_role' => User::ROLE_SUPER_ADMIN]);

        $this->travelTo(now()->setTime(9, 0));
        $this->actingAs($user)->get('/admin/leads')->assertOk();
        $this->actingAs($user)->get('/admin/clients')->assertOk();
        $this->actingAs($user)->get('/dpm/projects')->assertOk();

        $this->assertSame(1, Activity::where('user_id', $user->id)->where('type', 'login')->count());

        // Next day, same session (no login form): attendance is credited again.
        $this->travelTo(now()->addDay()->setTime(10, 0));
        $this->actingAs($user)->get('/admin/leads')->assertOk();

        $this->assertSame(2, Activity::where('user_id', $user->id)->where('type', 'login')->count());
    }

    public function test_login_and_first_page_do_not_double_count(): void
    {
        $user = User::factory()->create(['team_role' => User::ROLE_SUPER_ADMIN]);

        $this->post('/login', ['email' => $user->email, 'password' => 'password']);
        $this->get('/admin/leads');

        $this->assertSame(1, Activity::where('user_id', $user->id)->where('type', 'login')->count());
    }

    public function test_public_pages_do_not_record_attendance(): void
    {
        $user = User::factory()->create(['team_role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($user)->get('/about')->assertOk();

        $this->assertSame(0, Activity::where('type', 'login')->count());
    }
}
