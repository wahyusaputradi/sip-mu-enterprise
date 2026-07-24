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
            // Composite index for employee search + date filter + status
            $table->index(['employee_id', 'date', 'status'], 'attendances_employee_date_status_index');
            // Single index on date for general date range queries
            $table->index('date', 'attendances_date_index');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            // Composite index for teaching search + date filter + status
            $table->index(['employee_id', 'date', 'status'], 'teaching_attendances_employee_date_status_index');
            // Single index on date for general date range queries
            $table->index('date', 'teaching_attendances_date_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('attendances_employee_date_status_index');
            $table->dropIndex('attendances_date_index');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            $table->dropIndex('teaching_attendances_employee_date_status_index');
            $table->dropIndex('teaching_attendances_date_index');
        });
    }
};
