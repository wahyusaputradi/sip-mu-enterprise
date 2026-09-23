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
        Schema::create('exam_supervision_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_supervision_schedule_id')
                  ->constrained('exam_supervision_schedules', 'id', 'fk_exam_sup_att_schedule_id')
                  ->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'late', 'alpha', 'permit', 'sick'])->default('present');
            $table->string('photo_path')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_supervision_attendances');
    }
};
