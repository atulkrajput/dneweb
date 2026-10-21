<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_interests', function (Blueprint $table) {
            $table->boolean('demo_requested')->default(false)->after('message');
            $table->timestamp('demo_sent_at')->nullable()->after('demo_requested');
            $table->foreignId('lead_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('product_interests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lead_id');
            $table->dropColumn(['demo_requested', 'demo_sent_at']);
        });
    }
};
