<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teaching_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat
            $table->tinyInteger('hour_number'); // 1-10
            $table->string('subject'); // Mata pelajaran, e.g. "PAIBP"
            $table->timestamps();

            // Guru tidak bisa double-booking pada jam & hari yang sama
            $table->unique(['employee_id', 'day_of_week', 'hour_number'], 'unique_teacher_slot');
            // Kelas tidak bisa dipakai 2 guru sekaligus pada jam & hari yang sama
            $table->unique(['school_class_id', 'day_of_week', 'hour_number'], 'unique_class_slot');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teaching_schedules');
    }
};
