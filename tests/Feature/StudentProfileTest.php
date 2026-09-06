<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class StudentProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Siswa']);
    }

    protected function createStudentUser(): array
    {
        $class = SchoolClass::create(['name' => 'X PPLG 1', 'level' => 'X', 'major' => 'PPLG']);
        $user = User::factory()->create([
            'username' => '2026888',
            'email' => '2026888@siswa.smkmu.sch.id',
        ]);
        $user->assignRole('Siswa');

        $student = Student::create([
            'user_id' => $user->id,
            'nis' => '2026888',
            'name' => 'Siswa Profile Test',
            'gender' => 'Laki-laki',
            'school_class_id' => $class->id,
            'qr_token' => 'SIPMU-STD-2026888-TESTHASH',
            'status' => 'active',
        ]);

        return [$user, $student];
    }

    public function test_student_can_view_profile_page()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->get(route('student-portal.profile'));
        $response->assertStatus(200);
    }

    public function test_student_can_update_profile_and_parent_biodata()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->post(route('student-portal.profile.update'), [
            'name' => 'Siswa Profile Test Updated',
            'gender' => 'Laki-laki',
            'pob' => 'Cirebon',
            'dob' => '2008-05-20',
            'nik' => '3209123456780001',
            'address' => 'Jl. Pendidikan No. 10',
            'rt' => '002',
            'rw' => '005',
            'village' => 'Mundu',
            'district' => 'Mundu',
            'regency' => 'Kabupaten Cirebon',
            'family_card_number' => '3209123456789999',
            'student_phone' => '081234567890',
            'father_name' => 'Ayah Test',
            'father_nik' => '3209123456780002',
            'father_phone' => '081987654321',
            'father_job' => 'Wiraswasta',
            'mother_name' => 'Ibu Test',
            'mother_nik' => '3209123456780003',
            'mother_phone' => '081987654322',
            'mother_job' => 'Ibu Rumah Tangga',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'nik' => '3209123456780001',
            'father_name' => 'Ayah Test',
            'mother_name' => 'Ibu Test',
        ]);
    }

    public function test_non_numeric_nik_rejected_by_validation()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->post(route('student-portal.profile.update'), [
            'name' => 'Siswa Test',
            'gender' => 'Laki-laki',
            'nik' => '3209ABC12345678', // Non numeric
        ]);

        $response->assertSessionHasErrors('nik');
    }

    public function test_alphanumeric_kip_number_is_accepted()
    {
        [$user, $student] = $this->createStudentUser();

        $response = $this->actingAs($user)->post(route('student-portal.profile.update'), [
            'name' => 'Siswa Test KIP',
            'gender' => 'Laki-laki',
            'kip_number' => 'KIP-889900-X',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'kip_number' => 'KIP-889900-X',
        ]);
    }
}
