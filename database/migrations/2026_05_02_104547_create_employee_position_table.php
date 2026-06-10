<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create pivot table
        Schema::create('employee_position', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('position_id')->constrained()->onDelete('cascade');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['employee_id', 'position_id']);
        });

        // 2. Migrate existing data from position_id column to pivot table
        $employees = DB::table('employees')->whereNotNull('position_id')->get();
        foreach ($employees as $employee) {
            DB::table('employee_position')->insert([
                'employee_id' => $employee->id,
                'position_id' => $employee->position_id,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Drop the old position_id column and its foreign key
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropColumn('position_id');
        });
    }

    public function down(): void
    {
        // Re-add position_id column
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('position_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
        });

        // Restore data from pivot table (primary position only)
        $pivots = DB::table('employee_position')->where('is_primary', true)->get();
        foreach ($pivots as $pivot) {
            DB::table('employees')->where('id', $pivot->employee_id)->update([
                'position_id' => $pivot->position_id,
            ]);
        }

        Schema::dropIfExists('employee_position');
    }
};
