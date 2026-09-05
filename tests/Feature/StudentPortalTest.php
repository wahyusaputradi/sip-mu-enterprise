<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class StudentPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Siswa']);
    }

    protected function createStudentUser(): array
    {
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $user = User::factory()->create([
            'username' => '2026999',
        ]);
        $user->assignRole('Siswa');

        $student = Student::create([
            'user_id' => $user->id,
            'nis' => '2026999',
            'name' => 'Siswa Mandiri Test',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'qr_token' => 'SIPMU-STD-2026999-TESTHASH',
            'status' => 'active',
        ]);

        return [$user, $student];
    }

    public function test_student_can_access_portal_dashboard()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->get(route('student-portal.dashboard'));
        $response->assertStatus(200);
    }

    public function test_student_can_access_history()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->get(route('student-portal.history'));
        $response->assertStatus(200);
    }

    public function test_student_can_submit_leave_request()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->post(route('student-portal.leave-requests.store'), [
            'type' => 'sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'reason' => 'Demam tinggi dengan surat dokter',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_leave_requests', [
            'student_id' => $student->id,
            'type' => 'sick',
            'status' => 'pending',
        ]);
    }

    public function test_student_can_view_digital_card()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->get(route('student-portal.digital-card'));
        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_student_portal()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Super Admin');

        $response = $this->actingAs($adminUser)->get(route('student-portal.dashboard'));
        $response->assertStatus(403);
    }
}
