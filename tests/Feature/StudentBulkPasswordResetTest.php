<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class StudentBulkPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Siswa']);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');
        return $user;
    }

    public function test_super_admin_can_bulk_reset_student_passwords()
    {
        $admin = $this->createAdminUser();

        $class = SchoolClass::create([
            'name' => 'XII PPLG 1',
            'level' => 'XII',
            'major' => 'PPLG',
        ]);

        $studentUser1 = User::create([
            'name' => 'Siswa Test 1',
            'username' => '8001',
            'email' => '8001@siswa.smkmu.sch.id',
            'password' => Hash::make('old_secret_1'),
        ]);
        $studentUser1->assignRole('Siswa');

        $student1 = Student::create([
            'nis' => '8001',
            'name' => 'Siswa Test 1',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'status' => 'active',
            'user_id' => $studentUser1->id,
            'qr_token' => 'SIPMU-8001',
        ]);

        $studentUser2 = User::create([
            'name' => 'Siswa Test 2',
            'username' => '8002',
            'email' => '8002@siswa.smkmu.sch.id',
            'password' => Hash::make('old_secret_2'),
        ]);
        $studentUser2->assignRole('Siswa');

        $student2 = Student::create([
            'nis' => '8002',
            'name' => 'Siswa Test 2',
            'gender' => 'Perempuan',
            'school_class_id' => $class->id,
            'status' => 'active',
            'user_id' => $studentUser2->id,
            'qr_token' => 'SIPMU-8002',
        ]);

        $response = $this->actingAs($admin)->post(route('user-authority.students.bulk-reset-password'), [
            'student_ids' => [$student1->id, $student2->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertTrue(Hash::check('password', $studentUser1->fresh()->password));
        $this->assertTrue(Hash::check('password', $studentUser2->fresh()->password));
    }
}
