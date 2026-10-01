<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('period');                 // YYYY-MM
            $table->string('platform');               // facebook, instagram, linkedin, twitter, website
            $table->unsignedInteger('posts_published')->default(0); // effort/output
            $table->json('metrics')->nullable();      // flexible per-platform numbers (impressions, views, clicks, etc.)
            $table->foreignId('goal_id')->nullable()->constrained('goals')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['period', 'platform']);
            $table->index('period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_metrics');
    }
};
