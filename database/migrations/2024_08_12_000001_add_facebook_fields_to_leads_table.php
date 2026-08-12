<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('facebook_lead_id')->nullable()->after('msclkid');
            $table->string('facebook_page_id')->nullable()->after('facebook_lead_id');
            $table->string('facebook_form_id')->nullable()->after('facebook_page_id');

            $table->index('facebook_lead_id');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['facebook_lead_id']);
            $table->dropColumn(['facebook_lead_id', 'facebook_page_id', 'facebook_form_id']);
        });
    }
};
