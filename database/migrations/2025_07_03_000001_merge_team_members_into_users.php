<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename 'role' to 'team_role' on users table
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role', 'team_role');
        });

        // Add team member fields to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('position')->nullable()->after('team_role'); // display role/title (was 'role' on team_members)
            $table->text('bio')->nullable()->after('position');
            $table->string('photo')->nullable()->after('bio');
            $table->integer('sort_order')->default(0)->after('photo');
            $table->boolean('is_active')->default(true)->after('sort_order');
        });

        // Migrate data from team_members to users (match by name)
        $teamMembers = DB::table('team_members')->get();
        foreach ($teamMembers as $member) {
            $user = DB::table('users')->where('name', $member->name)->first();
            if ($user) {
                DB::table('users')->where('id', $user->id)->update([
                    'position' => $member->role,
                    'bio' => $member->bio,
                    'photo' => $member->photo,
                    'sort_order' => $member->sort_order,
                    'is_active' => $member->is_active,
                ]);
            } else {
                // Create user entry for team members that don't have a user account
                DB::table('users')->insert([
                    'name' => $member->name,
                    'email' => strtolower(str_replace(' ', '.', $member->name)) . '@placeholder.local',
                    'password' => bcrypt('changeme123'),
                    'team_role' => 'developer',
                    'position' => $member->role,
                    'bio' => $member->bio,
                    'photo' => $member->photo,
                    'sort_order' => $member->sort_order,
                    'is_active' => $member->is_active,
                    'created_at' => $member->created_at,
                    'updated_at' => $member->updated_at,
                ]);
            }
        }

        // Update tasks.assignee_id to reference users instead of team_members
        // First drop the old foreign key
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['assignee_id']);
        });

        // Remap assignee_id values from team_members.id to users.id
        $teamMembers = DB::table('team_members')->get();
        foreach ($teamMembers as $member) {
            $user = DB::table('users')->where('name', $member->name)->first();
            if ($user) {
                DB::table('tasks')
                    ->where('assignee_id', $member->id)
                    ->update(['assignee_id' => $user->id]);
            }
        }

        // Add new foreign key pointing to users
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('assignee_id')->references('id')->on('users')->nullOnDelete();
        });

        // Drop the old team_members table
        Schema::dropIfExists('team_members');
    }

    public function down(): void
    {
        // Recreate team_members table
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role');
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Drop new foreign key on tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['assignee_id']);
        });

        // Restore original foreign key
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('assignee_id')->references('id')->on('team_members')->nullOnDelete();
        });

        // Remove added columns from users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['position', 'bio', 'photo', 'sort_order', 'is_active']);
        });

        // Rename team_role back to role
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('team_role', 'role');
        });
    }
};
