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
        Schema::table('students', function (Blueprint $table) {
            // Biodata Siswa
            $table->string('pob', 100)->nullable()->after('gender'); // Tempat Lahir
            $table->date('dob')->nullable()->after('pob'); // Tanggal Lahir
            $table->string('nik', 20)->nullable()->after('dob'); // NIK Siswa
            $table->text('address')->nullable()->after('nik'); // Alamat Lengkap
            $table->string('rt', 10)->nullable()->after('address'); // RT
            $table->string('rw', 10)->nullable()->after('rt'); // RW
            $table->string('village', 100)->nullable()->after('rw'); // Kelurahan / Desa
            $table->string('district', 100)->nullable()->after('village'); // Kecamatan
            $table->string('regency', 100)->nullable()->after('district'); // Kabupaten / Kota
            $table->string('kip_number', 50)->nullable()->after('regency'); // Nomor KIP
            $table->string('previous_school', 150)->nullable()->after('kip_number'); // Sekolah Asal
            $table->string('family_card_number', 20)->nullable()->after('previous_school'); // Nomor KK
            $table->string('student_phone', 30)->nullable()->after('family_card_number'); // No HP Siswa

            // Biodata Ayah
            $table->string('father_name', 150)->nullable()->after('student_phone');
            $table->string('father_pob', 100)->nullable()->after('father_name');
            $table->date('father_dob')->nullable()->after('father_pob');
            $table->string('father_nik', 20)->nullable()->after('father_dob');
            $table->string('father_phone', 30)->nullable()->after('father_nik');
            $table->string('father_job', 100)->nullable()->after('father_phone');

            // Biodata Ibu
            $table->string('mother_name', 150)->nullable()->after('father_job');
            $table->string('mother_pob', 100)->nullable()->after('mother_name');
            $table->date('mother_dob')->nullable()->after('mother_pob');
            $table->string('mother_nik', 20)->nullable()->after('mother_dob');
            $table->string('mother_phone', 30)->nullable()->after('mother_nik');
            $table->string('mother_job', 100)->nullable()->after('mother_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'pob', 'dob', 'nik', 'address', 'rt', 'rw', 'village', 'district', 'regency',
                'kip_number', 'previous_school', 'family_card_number', 'student_phone',
                'father_name', 'father_pob', 'father_dob', 'father_nik', 'father_phone', 'father_job',
                'mother_name', 'mother_pob', 'mother_dob', 'mother_nik', 'mother_phone', 'mother_job'
            ]);
        });
    }
};
