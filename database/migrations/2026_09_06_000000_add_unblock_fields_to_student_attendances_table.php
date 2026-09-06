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
        Schema::table('student_attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('student_attendances', 'is_unlocked')) {
                $table->boolean('is_unlocked')->default(false)->after('scanned_by_user_id');
            }
            if (!Schema::hasColumn('student_attendances', 'unlocked_by_user_id')) {
                $table->foreignId('unlocked_by_user_id')->nullable()->after('is_unlocked')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('student_attendances', 'unlocked_reason')) {
                $table->string('unlocked_reason')->nullable()->after('unlocked_by_user_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_attendances', function (Blueprint $table) {
            if (Schema::hasColumn('student_attendances', 'unlocked_by_user_id')) {
                $table->dropForeign(['unlocked_by_user_id']);
                $table->dropColumn('unlocked_by_user_id');
            }
            if (Schema::hasColumn('student_attendances', 'is_unlocked')) {
                $table->dropColumn('is_unlocked');
            }
            if (Schema::hasColumn('student_attendances', 'unlocked_reason')) {
                $table->dropColumn('unlocked_reason');
            }
        });
    }
};
