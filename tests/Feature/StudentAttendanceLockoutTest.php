<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StudentAttendanceLockoutTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Guru']);
        Role::firstOrCreate(['name' => 'Kesiswaan']);

        $this->user = User::factory()->create();
        $this->user->assignRole('Super Admin');

        SystemSetting::updateOrCreate(['key' => 'student_jam_masuk_buka'], ['value' => '06:00']);
        SystemSetting::updateOrCreate(['key' => 'student_jam_masuk'], ['value' => '07:00']);
        SystemSetting::updateOrCreate(['key' => 'student_batas_terlambat_menit'], ['value' => '15']);
        SystemSetting::updateOrCreate(['key' => 'student_jam_pulang'], ['value' => '15:00']);
        SystemSetting::updateOrCreate(['key' => 'student_jam_pulang_tutup'], ['value' => '17:30']);
    }

    public function test_student_cannot_check_in_before_opening_time(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(5, 30)); // 05:30 WIB (before 06:00)

        $student = Student::create([
            'name' => 'Siswa 1',
            'nis' => '10001',
            'status' => 'active',
            'qr_token' => 'TOKEN123',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('student-attendance.scan-qr'), [
            'qr_token' => 'TOKEN123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_student_check_in_is_blocked_after_late_cutoff(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(7, 30)); // 07:30 WIB (after 07:15 cutoff)

        $student = Student::create([
            'name' => 'Siswa 2',
            'nis' => '10002',
            'status' => 'active',
            'qr_token' => 'TOKEN123',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('student-attendance.scan-qr'), [
            'qr_token' => 'TOKEN123',
        ]);

        $response->assertStatus(423)
            ->assertJson([
                'success' => false,
                'status' => 'blocked',
            ]);
    }

    public function test_student_cannot_check_out_before_dismissal_time(): void
    {
        // First check in on time at 06:30
        Carbon::setTestNow(Carbon::today()->setTime(6, 30));
        $student = Student::create([
            'name' => 'Siswa 3',
            'nis' => '10003',
            'status' => 'active',
            'qr_token' => 'TOKEN123',
        ]);

        $this->actingAs($this->user)->postJson(route('student-attendance.scan-qr'), ['qr_token' => 'TOKEN123']);

        // Try to scan out at 10:00 AM (before 15:00 dismissal time)
        Carbon::setTestNow(Carbon::today()->setTime(10, 0));

        $response = $this->actingAs($this->user)->postJson(route('student-attendance.scan-qr'), [
            'qr_token' => 'TOKEN123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_homeroom_teacher_can_unblock_student_in_their_class(): void
    {
        $schoolClass = SchoolClass::create(['name' => 'X-RPL-1']);
        
        $teacherUser = User::factory()->create();
        $teacherUser->assignRole('Guru');

        $employee = Employee::create([
            'user_id' => $teacherUser->id,
            'name' => 'Wali Kelas Guru',
            'nik' => '123456',
            'status' => 'active',
            'is_homeroom_teacher' => true,
            'homeroom_class' => 'X-RPL-1',
        ]);
        $schoolClass->update(['homeroom_teacher_id' => $employee->id]);

        $student = Student::create([
            'name' => 'Siswa 4',
            'nis' => '10004',
            'school_class_id' => $schoolClass->id,
            'status' => 'active',
            'qr_token' => 'TOKEN123',
        ]);

        Carbon::setTestNow(Carbon::today()->setTime(8, 0)); // 08:00 WIB (Blocked time)

        $response = $this->actingAs($teacherUser)
            ->post(route('student-attendance.unblock'), [
                'student_id' => $student->id,
                'reason' => 'Ban sepeda motor bocor',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $student->id,
            'is_unlocked' => true,
            'check_in_status' => 'late',
            'unlocked_reason' => 'Ban sepeda motor bocor',
        ]);
    }
}
