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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nis')->unique();
            $table->string('nisn')->nullable()->unique();
            $table->string('name');
            $table->string('gender')->default('Laki-laki');
            $table->unsignedBigInteger('school_class_id')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('parent_phone')->nullable();
            $table->string('qr_token')->unique();
            $table->string('status')->default('active'); // active, graduated, moved
            $table->string('photo')->nullable();
            $table->timestamps();

            $table->foreign('school_class_id')->references('id')->on('school_classes')->onDelete('set null');
            $table->index(['school_class_id', 'status']);
            $table->index('qr_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
