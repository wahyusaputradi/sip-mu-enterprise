<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "XII TFM-1"
            $table->string('level')->nullable(); // e.g. "X", "XI", "XII"
            $table->string('major')->nullable(); // e.g. "TFM", "MPB", "BCP"
            $table->integer('order')->default(0); // for sorting
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
