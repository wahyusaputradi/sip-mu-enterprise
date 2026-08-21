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
            $table->index(['date', 'employee_id'], 'idx_attendances_date_emp');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            $table->index(['date', 'employee_id'], 'idx_teaching_atts_date_emp');
        });

        Schema::table('teaching_schedules', function (Blueprint $table) {
            $table->index(['day_of_week', 'employee_id'], 'idx_teaching_sched_dow_emp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendances_date_emp');
        });

        Schema::table('teaching_attendances', function (Blueprint $table) {
            $table->dropIndex('idx_teaching_atts_date_emp');
        });

        Schema::table('teaching_schedules', function (Blueprint $table) {
            $table->dropIndex('idx_teaching_sched_dow_emp');
        });
    }
};
