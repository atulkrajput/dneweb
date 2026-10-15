<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Swap the old contact address in the Terms of Service for hello@dneco.io,
     * leaving the rest of the (admin-editable) content untouched.
     */
    public function up(): void
    {
        $page = DB::table('legal_pages')->where('slug', 'terms-of-service')->first();

        if ($page && str_contains((string) $page->content, 'build@dnetechnology.com')) {
            DB::table('legal_pages')->where('id', $page->id)->update([
                'content' => str_replace('build@dnetechnology.com', 'hello@dneco.io', $page->content),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Content update only.
    }
};
