<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update the type enum to include new types
        DB::statement("ALTER TABLE leave_requests MODIFY COLUMN `type` ENUM('cuti', 'izin', 'sakit', 'izin_pribadi', 'izin_dinas_luar') NOT NULL DEFAULT 'cuti'");

        // Migrate old 'izin' values to 'izin_pribadi'
        DB::table('leave_requests')->where('type', 'izin')->update(['type' => 'izin_pribadi']);

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('reason');
            $table->string('attachment_name')->nullable()->after('attachment_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['attachment_path', 'attachment_name']);
        });

        DB::statement("ALTER TABLE leave_requests MODIFY COLUMN `type` ENUM('cuti', 'izin', 'sakit') NOT NULL DEFAULT 'cuti'");
    }
};
