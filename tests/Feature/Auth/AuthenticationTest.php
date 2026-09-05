<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_student_users_redirected_to_student_portal_after_login(): void
    {
        \Spatie\Permission\Models\Role::create(['name' => 'Siswa']);
        $user = User::factory()->create();
        $user->assignRole('Siswa');

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'login_mode' => 'siswa',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('student-portal.dashboard', absolute: false));
    }

    public function test_strict_role_mode_prevents_mismatched_logins(): void
    {
        \Spatie\Permission\Models\Role::create(['name' => 'Siswa']);
        \Spatie\Permission\Models\Role::create(['name' => 'Super Admin']);

        $studentUser = User::factory()->create();
        $studentUser->assignRole('Siswa');

        $adminUser = User::factory()->create();
        $adminUser->assignRole('Super Admin');

        // 1. Siswa mencoba login lewat tab Pegawai -> Gagal
        $response1 = $this->post('/login', [
            'login' => $studentUser->email,
            'password' => 'password',
            'login_mode' => 'pegawai',
        ]);
        $this->assertGuest();
        $response1->assertSessionHasErrors('login');

        // 2. Admin mencoba login lewat tab Siswa -> Gagal
        $response2 = $this->post('/login', [
            'login' => $adminUser->email,
            'password' => 'password',
            'login_mode' => 'siswa',
        ]);
        $this->assertGuest();
        $response2->assertSessionHasErrors('login');
    }
}
