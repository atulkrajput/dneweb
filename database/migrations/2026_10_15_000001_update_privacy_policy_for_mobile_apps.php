<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Replace the Privacy Policy content with the version that also covers our
     * mobile apps (Google Play requirements: data use, sharing, retention,
     * security and account/data deletion).
     */
    public function up(): void
    {
        $values = [
            'title' => 'Privacy Policy',
            'meta_title' => 'Privacy Policy | DNE Consultants',
            'meta_description' => 'How DNE Consultants collects, uses, shares, retains and protects personal information across our website and mobile apps, and how to request account and data deletion.',
            'content' => file_get_contents(database_path('content/privacy-policy.html')),
            'is_active' => true,
            'updated_at' => now(),
        ];

        if (DB::table('legal_pages')->where('slug', 'privacy-policy')->exists()) {
            DB::table('legal_pages')->where('slug', 'privacy-policy')->update($values);
        } else {
            DB::table('legal_pages')->insert($values + ['slug' => 'privacy-policy', 'created_at' => now()]);
        }
    }

    public function down(): void
    {
        // Content update only; nothing to roll back structurally.
    }
};
