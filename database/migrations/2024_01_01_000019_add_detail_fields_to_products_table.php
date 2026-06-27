<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('summary')->nullable()->after('description');
            $table->text('details')->nullable()->after('summary');
            $table->text('features_detail')->nullable()->after('details');
            $table->json('screenshots')->nullable()->after('features_detail');
            $table->string('demo_link')->nullable()->after('screenshots');
            $table->text('demo_credentials')->nullable()->after('demo_link');
            $table->string('status')->default('active')->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['summary', 'details', 'features_detail', 'screenshots', 'demo_link', 'demo_credentials', 'status']);
        });
    }
};
