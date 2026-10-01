<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();

            // revenue, growth, product, infrastructure, maintenance
            $table->string('category')->default('growth')->index();

            // What we measure and the concrete target + deadline (the operating rule).
            $table->string('measure')->nullable();        // e.g. "qualified inquiries"
            $table->string('unit')->nullable();           // e.g. "leads", "$", "users"
            $table->decimal('baseline_value', 15, 2)->nullable();
            $table->decimal('target_value', 15, 2)->nullable();
            $table->decimal('current_value', 15, 2)->default(0);
            $table->date('target_date')->nullable();

            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();

            // active, achieved, missed, paused
            $table->string('status')->default('active')->index();

            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('target_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
