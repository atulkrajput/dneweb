<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('landing_url')->nullable()->after('status');
            $table->string('referrer')->nullable()->after('landing_url');
            $table->string('utm_source')->nullable()->after('referrer');
            $table->string('utm_medium')->nullable()->after('utm_source');
            $table->string('utm_campaign')->nullable()->after('utm_medium');
            $table->string('utm_content')->nullable()->after('utm_campaign');
            $table->string('utm_term')->nullable()->after('utm_content');
            $table->string('gclid')->nullable()->after('utm_term');
            $table->string('fbclid')->nullable()->after('gclid');
            $table->string('msclkid')->nullable()->after('fbclid');
            $table->string('browser')->nullable()->after('msclkid');
            $table->string('device')->nullable()->after('browser');
            $table->string('visitor_country')->nullable()->after('device');
            $table->string('ip_address')->nullable()->after('visitor_country');
            $table->timestamp('first_visit_at')->nullable()->after('ip_address');
            $table->timestamp('last_visit_at')->nullable()->after('first_visit_at');

            $table->index('utm_source');
            $table->index('utm_campaign');
            $table->index('utm_medium');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['utm_source']);
            $table->dropIndex(['utm_campaign']);
            $table->dropIndex(['utm_medium']);

            $table->dropColumn([
                'landing_url', 'referrer',
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
                'gclid', 'fbclid', 'msclkid',
                'browser', 'device', 'visitor_country', 'ip_address',
                'first_visit_at', 'last_visit_at',
            ]);
        });
    }
};
