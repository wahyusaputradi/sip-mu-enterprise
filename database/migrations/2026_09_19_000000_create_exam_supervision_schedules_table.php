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
        Schema::create('exam_supervision_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 1 = Senin, ..., 5 = Jumat
            $table->unsignedTinyInteger('session_number'); // 1 s.d 4
            $table->string('subject');
            $table->string('room_name')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'day_of_week', 'session_number'], 'exam_sup_emp_day_sess_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_supervision_schedules');
    }
};
