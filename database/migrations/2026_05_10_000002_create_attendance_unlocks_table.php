<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_unlocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->enum('type', ['daily_checkin', 'daily_checkout', 'teaching'])->default('daily_checkin');
            $table->foreignId('teaching_schedule_id')->nullable()->constrained('teaching_schedules')->nullOnDelete();
            $table->foreignId('unlocked_by')->constrained('users')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->boolean('used')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_unlocks');
    }
};
