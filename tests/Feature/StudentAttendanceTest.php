<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class StudentAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Absensi']);
    }

    protected function createAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');
        return $user;
    }

    public function test_can_create_student_and_auto_generate_qr_token()
    {
        $admin = $this->createAdmin();
        $schoolClass = SchoolClass::create(['name' => 'X TJKT 1', 'level' => 'X', 'major' => 'TJKT']);

        $response = $this->actingAs($admin)
            ->post(route('students.store'), [
                'nis' => '2026001',
                'nisn' => '0051234567',
                'name' => 'Budi Santoso',
                'gender' => 'Laki-laki',
                'school_class_id' => $schoolClass->id,
                'parent_name' => 'Bapak Santoso',
                'parent_phone' => '08123456789',
                'status' => 'active',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('students', [
            'nis' => '2026001',
            'name' => 'Budi Santoso',
            'school_class_id' => $schoolClass->id,
        ]);

        $student = Student::where('nis', '2026001')->first();
        $this->assertNotNull($student->qr_token);
        $this->assertStringStartsWith('SIPMU-STD-', $student->qr_token);
    }

    public function test_kiosk_qr_scan_morning_check_in_on_time()
    {
        $admin = $this->createAdmin();
        $schoolClass = SchoolClass::create(['name' => 'X TJKT 1']);
        $student = Student::create([
            'nis' => '2026002',
            'name' => 'Siti Aminah',
            'gender' => 'Perempuan',
            'school_class_id' => $schoolClass->id,
            'qr_token' => 'SIPMU-STD-2026002-HASH123',
            'status' => 'active',
        ]);

        SystemSetting::updateOrCreate(['key' => 'student_jam_masuk'], ['value' => '07:00']);
        SystemSetting::updateOrCreate(['key' => 'student_batas_terlambat_menit'], ['value' => '15']);

        // Mock morning arrival time 06:50 WIB
        Carbon::setTestNow(Carbon::today()->setHour(6)->setMinute(50));

        $response = $this->actingAs($admin)
            ->postJson(route('student-attendance.scan-qr'), [
                'qr_token' => $student->qr_token,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'mode' => 'check_in',
            'status' => 'present',
        ]);

        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $student->id,
            'check_in_status' => 'present',
        ]);

        Carbon::setTestNow();
    }

    public function test_kiosk_qr_scan_morning_check_in_late()
    {
        $admin = $this->createAdmin();
        $schoolClass = SchoolClass::create(['name' => 'X TJKT 1']);
        $student = Student::create([
            'nis' => '2026003',
            'name' => 'Ahmad Rizki',
            'gender' => 'Laki-laki',
            'school_class_id' => $schoolClass->id,
            'qr_token' => 'SIPMU-STD-2026003-HASH456',
            'status' => 'active',
        ]);

        SystemSetting::updateOrCreate(['key' => 'student_jam_masuk'], ['value' => '07:00']);
        SystemSetting::updateOrCreate(['key' => 'student_batas_terlambat_menit'], ['value' => '15']);

        // Mock arrival past deadline at 07:30 WIB
        Carbon::setTestNow(Carbon::today()->setHour(7)->setMinute(30));

        $response = $this->actingAs($admin)
            ->postJson(route('student-attendance.scan-qr'), [
                'qr_token' => $student->qr_token,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'mode' => 'check_in',
            'status' => 'late',
        ]);

        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $student->id,
            'check_in_status' => 'late',
        ]);

        Carbon::setTestNow();
    }

    public function test_admin_manual_status_update()
    {
        $admin = $this->createAdmin();
        $schoolClass = SchoolClass::create(['name' => 'XI TKRO 2']);
        $student = Student::create([
            'nis' => '2026004',
            'name' => 'Dewi Lestari',
            'gender' => 'Perempuan',
            'school_class_id' => $schoolClass->id,
            'qr_token' => 'SIPMU-STD-2026004-HASH789',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->post(route('student-attendance.update-status'), [
                'student_id' => $student->id,
                'date' => Carbon::today()->toDateString(),
                'status' => 'sick',
                'notes' => 'Surat Keterangan Dokter Puskesmas',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $student->id,
            'check_in_status' => 'sick',
            'notes' => 'Surat Keterangan Dokter Puskesmas',
        ]);
    }

    public function test_can_view_student_attendance_monthly_recap_page()
    {
        $admin = $this->createAdmin();
        $schoolClass = SchoolClass::create(['name' => 'X TJKT 1']);
        $student = Student::create([
            'nis' => '2026005',
            'name' => 'Eka Putra',
            'gender' => 'Laki-laki',
            'school_class_id' => $schoolClass->id,
            'qr_token' => 'SIPMU-STD-2026005-HASH999',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('student-attendance.recap', [
                'month' => Carbon::now()->month,
                'year' => Carbon::now()->year,
                'class_id' => $schoolClass->id,
            ]));

        $response->assertStatus(200);
    }
}
