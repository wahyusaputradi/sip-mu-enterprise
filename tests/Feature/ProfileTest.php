<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function createUserWithEmployee(): User
    {
        $user = User::factory()->create();
        Employee::create([
            'user_id' => $user->id,
            'nik' => '12345678',
            'name' => $user->name,
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);
        return $user;
    }

    public function test_profile_page_is_displayed(): void
    {
        $user = $this->createUserWithEmployee();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = $this->createUserWithEmployee();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->put('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'gender' => 'Laki-laki',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = $this->createUserWithEmployee();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->put('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
                'gender' => 'Laki-laki',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }
}
