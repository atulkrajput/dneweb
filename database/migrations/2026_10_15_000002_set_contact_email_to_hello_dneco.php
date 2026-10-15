<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Point the public contact email (footer, contact page) at hello@dneco.io.
     * It stays editable afterwards in Admin → Settings → Contact Email.
     */
    public function up(): void
    {
        Setting::set('contact_email', 'hello@dneco.io', 'contact');
    }

    public function down(): void
    {
        // Value change only; edit it in Admin → Settings if needed.
    }
};
