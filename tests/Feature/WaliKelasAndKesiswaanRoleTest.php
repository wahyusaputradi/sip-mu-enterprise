<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class WaliKelasAndKesiswaanRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Guru']);
        Role::firstOrCreate(['name' => 'Kesiswaan']);
    }

    private function createWaliKelasUser(): array
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'nik' => '3201234567890001',
            'name' => 'Guru Wali Kelas',
            'gender' => 'Laki-laki',
            'is_homeroom_teacher' => true,
            'homeroom_class' => 'X PPLG 1',
        ]);
        $user->assignRole('Guru');

        $classOwned = SchoolClass::create([
            'name' => 'X PPLG 1',
            'level' => 'X',
            'major' => 'PPLG',
            'homeroom_teacher_id' => $employee->id,
        ]);

        $classOther = SchoolClass::create([
            'name' => 'X TJKT 1',
            'level' => 'X',
            'major' => 'TJKT',
        ]);

        $studentOwned = Student::create([
            'nis' => '9001',
            'name' => 'Siswa Kelas Wali',
            'gender' => 'Laki-laki',
            'school_class_id' => $classOwned->id,
            'status' => 'active',
            'qr_token' => 'SIPMU-9001',
        ]);

        $studentOther = Student::create([
            'nis' => '9002',
            'name' => 'Siswa Kelas Lain',
            'gender' => 'Perempuan',
            'school_class_id' => $classOther->id,
            'status' => 'active',
            'qr_token' => 'SIPMU-9002',
        ]);

        return [$user, $classOwned, $classOther, $studentOwned, $studentOther];
    }

    private function createKesiswaanUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Kesiswaan');
        return $user;
    }

    public function test_wali_kelas_can_view_students_page_scoped_to_their_class()
    {
        [$user, $classOwned, $classOther, $studentOwned, $studentOther] = $this->createWaliKelasUser();

        $response = $this->actingAs($user)->get(route('students.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->where('isHomeroomTeacher', true)
            ->where('isReadOnly', false)
        );
    }

    public function test_wali_kelas_cannot_add_student_to_other_class()
    {
        [$user, $classOwned, $classOther] = $this->createWaliKelasUser();

        $response = $this->actingAs($user)->post(route('students.store'), [
            'nis' => '9999',
            'name' => 'Siswa Terlarang',
            'gender' => 'Laki-laki',
            'school_class_id' => $classOther->id,
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }

    public function test_kesiswaan_role_can_view_all_student_management_pages()
    {
        $user = $this->createKesiswaanUser();

        $this->actingAs($user)->get(route('students.index'))->assertStatus(200);
        $this->actingAs($user)->get(route('school-classes.index'))->assertStatus(200);
        $this->actingAs($user)->get(route('student-attendance.monitoring'))->assertStatus(200);
        $this->actingAs($user)->get(route('student-leave-requests.index'))->assertStatus(200);
        $this->actingAs($user)->get(route('student-attendance.recap'))->assertStatus(200);
        $this->actingAs($user)->get(route('students.cards'))->assertStatus(200);
    }

    public function test_kesiswaan_role_is_blocked_from_mutating_student_data()
    {
        $user = $this->createKesiswaanUser();

        // Try creating a student
        $response = $this->actingAs($user)->post(route('students.store'), [
            'nis' => '8888',
            'name' => 'Siswa Test',
            'gender' => 'Laki-laki',
            'school_class_id' => 1,
            'status' => 'active',
        ]);
        $response->assertStatus(403);

        // Try creating a class
        $responseClass = $this->actingAs($user)->post(route('school-classes.store'), [
            'name' => 'Kelas Baru Test',
        ]);
        $responseClass->assertStatus(403);
    }

    public function test_non_homeroom_teacher_is_blocked_from_student_management_pages()
    {
        $user = User::factory()->create();
        Employee::create([
            'user_id' => $user->id,
            'nik' => '3201234567890002',
            'name' => 'Guru Biasa',
            'gender' => 'Perempuan',
            'is_homeroom_teacher' => false,
        ]);
        $user->assignRole('Guru');

        $this->actingAs($user)->get(route('students.index'))->assertStatus(403);
        $this->actingAs($user)->get(route('student-attendance.monitoring'))->assertStatus(403);
        $this->actingAs($user)->get(route('student-leave-requests.index'))->assertStatus(403);
        $this->actingAs($user)->get(route('student-attendance.recap'))->assertStatus(403);
        $this->actingAs($user)->get(route('students.cards'))->assertStatus(403);
    }
}
