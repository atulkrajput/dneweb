<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider')->default('groq');
            $table->string('model')->nullable();
            $table->string('kind')->index();            // task_title, task_description, project_description, sprint_goal
            $table->string('status')->default('success'); // success | error
            $table->longText('input')->nullable();
            $table->longText('output')->nullable();
            $table->unsignedInteger('prompt_tokens')->nullable();
            $table->unsignedInteger('completion_tokens')->nullable();
            $table->unsignedInteger('total_tokens')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('created_at');
            $table->index(['kind', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
