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
        Schema::create('substitute_teachings', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('absent_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('substitute_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('teaching_schedule_id')->constrained('teaching_schedules')->cascadeOnDelete();
            $table->string('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('substitute_teachings');
    }
};
