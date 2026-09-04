<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class StudentAuthorityTest extends TestCase
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

    public function test_super_admin_can_access_user_authority_page_with_tabs()
    {
        $admin = $this->createAdmin();

        $responseEmployees = $this->actingAs($admin)->get(route('user-authority.index', ['tab' => 'employees']));
        $responseEmployees->assertStatus(200);

        $responseStudents = $this->actingAs($admin)->get(route('user-authority.index', ['tab' => 'students']));
        $responseStudents->assertStatus(200);
    }

    public function test_can_update_student_authority_and_regenerate_qr_token()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $student = Student::create([
            'nis' => '2026099',
            'name' => 'Siswa Test Authority',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'qr_token' => 'OLD-TOKEN-12345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->put(route('user-authority.students.update', $student->id), [
                'status' => 'active',
                'parent_phone' => '081299998888',
                'regenerate_qr' => true,
            ]);

        $response->assertSessionHasNoErrors();

        $student->refresh();
        $this->assertEquals('081299998888', $student->parent_phone);
        $this->assertNotEquals('OLD-TOKEN-12345', $student->qr_token);
        $this->assertStringStartsWith('SIPMU-STD-', $student->qr_token);
    }

    public function test_can_bulk_regenerate_student_qr_tokens()
    {
        $admin = $this->createAdmin();
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $s1 = Student::create(['nis' => '2026101', 'name' => 'S1', 'school_class_id' => $class->id, 'qr_token' => 'TOKEN-1', 'status' => 'active']);
        $s2 = Student::create(['nis' => '2026102', 'name' => 'S2', 'school_class_id' => $class->id, 'qr_token' => 'TOKEN-2', 'status' => 'active']);

        $response = $this->actingAs($admin)
            ->post(route('user-authority.students.bulk-regenerate-qr'), [
                'student_ids' => [$s1->id, $s2->id],
            ]);

        $response->assertSessionHasNoErrors();

        $s1->refresh();
        $s2->refresh();
        $this->assertNotEquals('TOKEN-1', $s1->qr_token);
        $this->assertNotEquals('TOKEN-2', $s2->qr_token);
    }
}
