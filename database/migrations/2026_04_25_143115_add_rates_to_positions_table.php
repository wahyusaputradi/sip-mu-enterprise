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
        Schema::table('positions', function (Blueprint $table) {
            $table->decimal('hourly_rate', 15, 2)->default(0)->after('base_salary');
            $table->decimal('inval_rate', 15, 2)->default(0)->after('hourly_rate');
            $table->decimal('alpha_penalty_rate', 15, 2)->default(0)->after('inval_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropColumn(['hourly_rate', 'inval_rate', 'alpha_penalty_rate']);
        });
    }
};
