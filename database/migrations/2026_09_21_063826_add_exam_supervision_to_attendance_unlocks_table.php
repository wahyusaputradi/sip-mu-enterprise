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
        // Add new column exam_supervision_schedule_id
        Schema::table('attendance_unlocks', function (Blueprint $table) {
            $table->foreignId('exam_supervision_schedule_id')
                  ->nullable()
                  ->after('teaching_schedule_id')
                  ->constrained('exam_supervision_schedules', 'id', 'fk_att_unlock_exam_sch_id')
                  ->nullOnDelete();
        });

        // Modify enum to add 'exam_supervision'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE attendance_unlocks MODIFY COLUMN type ENUM('daily_checkin', 'daily_checkout', 'teaching', 'exam_supervision') DEFAULT 'daily_checkin'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE attendance_unlocks MODIFY COLUMN type ENUM('daily_checkin', 'daily_checkout', 'teaching') DEFAULT 'daily_checkin'");

        // Drop column
        Schema::table('attendance_unlocks', function (Blueprint $table) {
            $table->dropForeign('fk_att_unlock_exam_sch_id');
            $table->dropColumn('exam_supervision_schedule_id');
        });
    }
};
