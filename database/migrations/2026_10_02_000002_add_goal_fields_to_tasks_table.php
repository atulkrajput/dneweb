<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('goal_id')->nullable()->after('project_id')
                ->constrained('goals')->nullOnDelete();

            // Impact level drives impact-points scoring and the "low/no impact" badge.
            // none, low, medium, high
            $table->string('impact_level')->default('medium')->after('priority')->index();

            $table->text('expected_impact')->nullable()->after('description');
            $table->text('actual_impact')->nullable()->after('expected_impact');

            // continue, change, stop — the review decision after the work is done.
            $table->string('outcome_decision')->nullable()->after('actual_impact');

            // When a task has no goal, this documents the risk the (maintenance) work prevents.
            $table->text('maintenance_risk')->nullable()->after('outcome_decision');

            $table->decimal('estimated_cost', 12, 2)->nullable()->after('actual_hours');

            $table->index('goal_id');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('goal_id');
            $table->dropColumn([
                'impact_level',
                'expected_impact',
                'actual_impact',
                'outcome_decision',
                'maintenance_risk',
                'estimated_cost',
            ]);
        });
    }
};
