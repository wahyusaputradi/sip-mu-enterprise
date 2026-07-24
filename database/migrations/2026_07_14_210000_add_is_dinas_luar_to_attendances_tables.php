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
        Schema::table('attendances', function (Blueprint $table) {
            $table->boolean('is_dinas_luar')->default(false)->after('status');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            $table->boolean('is_dinas_luar')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('is_dinas_luar');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            $table->dropColumn('is_dinas_luar');
        });
    }
};
