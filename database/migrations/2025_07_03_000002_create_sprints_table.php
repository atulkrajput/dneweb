<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('duration'); // week, two_weeks, month
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('planning'); // planning, active, completed
            $table->text('goal')->nullable();
            $table->timestamps();

            $table->index('project_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });

        // Add sprint_id to tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('sprint_id')->nullable()->after('project_id')->constrained()->nullOnDelete();
            $table->index('sprint_id');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['sprint_id']);
            $table->dropColumn('sprint_id');
        });

        Schema::dropIfExists('sprints');
    }
};
