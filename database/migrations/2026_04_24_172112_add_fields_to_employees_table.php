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
        if (Schema::hasColumn('employees', 'nip')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->renameColumn('nip', 'nik');
            });
        }

        Schema::table('employees', function (Blueprint $table) {
            $table->string('nuptk')->nullable()->after('nik');
            $table->string('birth_place')->nullable()->after('nuptk');
            $table->date('birth_date')->nullable()->after('birth_place');
            $table->enum('gender', ['Laki-laki', 'Perempuan'])->nullable()->after('birth_date');
            $table->date('join_date')->nullable()->after('phone');
            $table->string('education')->nullable()->after('join_date');
            $table->string('subject')->nullable()->after('education');
            $table->string('ukg_number')->nullable()->after('subject');
            $table->integer('teaching_hours')->nullable()->after('ukg_number');
            $table->boolean('is_homeroom_teacher')->default(false);
            $table->string('homeroom_class')->nullable();
            $table->boolean('is_extracurricular_builder')->default(false);
            $table->string('extracurricular_name')->nullable();
            $table->decimal('bpjs_deduction', 15, 2)->default(0);
            $table->decimal('school_loan', 15, 2)->default(0);
            $table->decimal('bmt_loan', 15, 2)->default(0);
            $table->decimal('cooperative_deduction', 15, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('nik', 'nip');
            $table->dropColumn([
                'nuptk',
                'birth_place',
                'birth_date',
                'gender',
                'join_date',
                'education',
                'subject',
                'ukg_number',
                'teaching_hours',
                'is_homeroom_teacher',
                'homeroom_class',
                'is_extracurricular_builder',
                'extracurricular_name',
                'bpjs_deduction',
                'school_loan',
                'bmt_loan',
                'cooperative_deduction',
            ]);
        });
    }
};
