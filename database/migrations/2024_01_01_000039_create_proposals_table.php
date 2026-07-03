<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->json('services')->nullable();
            $table->json('deliverables')->nullable();
            $table->string('timeline')->nullable();
            $table->json('pricing')->nullable(); // [{description, amount}]
            $table->decimal('total', 12, 2)->default(0);
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('draft'); // draft, sent, accepted, rejected
            $table->date('valid_until')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('lead_id');
            $table->index('client_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
