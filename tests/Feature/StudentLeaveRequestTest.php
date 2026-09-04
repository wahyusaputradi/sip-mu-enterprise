<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class StudentLeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Guru']);
    }

    protected function createAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');
        return $user;
    }

    protected function createHomeroomTeacher(SchoolClass $class): User
    {
        $user = User::factory()->create();

        $employee = Employee::create([
            'user_id' => $user->id,
            'nip' => '199001012020011001',
            'nik' => '3201010101010001',
            'name' => 'Wali Kelas Guru',
            'gender' => 'Laki-laki',
            'status' => 'Aktif',
            'join_date' => '2020-01-01',
        ]);

        $class->update(['homeroom_teacher_id' => $employee->id]);
        $user->assignRole('Guru');

        return $user;
    }

    public function test_admin_and_homeroom_teacher_can_view_student_leave_requests()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $teacherUser = $this->createHomeroomTeacher($class);

        $responseAdmin = $this->actingAs($admin)->get(route('student-leave-requests.index'));
        $responseAdmin->assertStatus(200);

        $responseTeacher = $this->actingAs($teacherUser)->get(route('student-leave-requests.index'));
        $responseTeacher->assertStatus(200);
    }

    public function test_can_create_student_leave_request()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $student = Student::create([
            'nis' => '2026002',
            'name' => 'Siswa Test',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'qr_token' => 'SIPMU-STD-TEST01',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->post(route('student-leave-requests.store'), [
                'student_id' => $student->id,
                'type' => 'sick',
                'start_date' => '2026-09-05',
                'end_date' => '2026-09-06',
                'reason' => 'Demam tinggi dan butuh istirahat',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_leave_requests', [
            'student_id' => $student->id,
            'class_id' => $class->id,
            'type' => 'sick',
            'status' => 'pending',
            'reason' => 'Demam tinggi dan butuh istirahat',
        ]);
    }

    public function test_approval_updates_status_and_syncs_student_attendances()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $student = Student::create([
            'nis' => '2026003',
            'name' => 'Siswa Approval Test',
            'gender' => 'Perempuan',
            'school_class_id' => $class->id,
            'qr_token' => 'SIPMU-STD-TEST02',
            'status' => 'active',
        ]);

        $leaveRequest = StudentLeaveRequest::create([
            'student_id' => $student->id,
            'class_id' => $class->id,
            'type' => 'permit',
            'start_date' => '2026-09-05',
            'end_date' => '2026-09-05',
            'reason' => 'Acara keluarga',
            'status' => 'pending',
            'submitted_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('student-leave-requests.approve', $leaveRequest->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_leave_requests', [
            'id' => $leaveRequest->id,
            'status' => 'approved',
            'approved_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $student->id,
            'check_in_status' => 'permit',
            'notes' => 'Acara keluarga',
        ]);
    }

    public function test_rejection_updates_status()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $student = Student::create([
            'nis' => '2026004',
            'name' => 'Siswa Reject Test',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'qr_token' => 'SIPMU-STD-TEST03',
            'status' => 'active',
        ]);

        $leaveRequest = StudentLeaveRequest::create([
            'student_id' => $student->id,
            'class_id' => $class->id,
            'type' => 'sick',
            'start_date' => '2026-09-05',
            'end_date' => '2026-09-05',
            'reason' => 'Tanpa keterangan jelas',
            'status' => 'pending',
            'submitted_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('student-leave-requests.reject', $leaveRequest->id), [
                'rejection_reason' => 'Surat tidak valid',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_leave_requests', [
            'id' => $leaveRequest->id,
            'status' => 'rejected',
            'rejection_reason' => 'Surat tidak valid',
        ]);
    }
}
