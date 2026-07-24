<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No action needed as rates are being purged.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed.
    }
};
