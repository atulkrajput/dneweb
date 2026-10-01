<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->nullable()->constrained('goals')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // qualified_lead, meeting, conversion, revenue, hours, cost, other
            $table->string('type')->index();
            $table->decimal('value', 15, 2)->default(0);
            $table->string('unit')->nullable();         // leads, meetings, $, hours
            $table->text('note')->nullable();
            $table->date('occurred_on')->index();

            $table->timestamps();

            $table->index(['goal_id', 'occurred_on']);
            $table->index(['type', 'occurred_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outcomes');
    }
};
