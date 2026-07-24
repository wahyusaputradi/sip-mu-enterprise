<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlphabeticalSortingTest extends TestCase
{
    use RefreshDatabase;

    public function test_employees_index_is_sorted_alphabetically()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        // Create employees with out-of-order names
        Employee::create(['name' => 'Zackry', 'nik' => '10001', 'status' => 'active']);
        Employee::create(['name' => 'Ahmad', 'nik' => '10002', 'status' => 'active']);
        Employee::create(['name' => 'Chandra', 'nik' => '10003', 'status' => 'active']);

        $response = $this->actingAs($user)->get(route('employees.index'));

        $response->assertStatus(200);

        // Get Inertia page props
        $employees = $response->original->getData()['page']['props']['employees'];

        $this->assertCount(3, $employees);
        $this->assertEquals('Ahmad', $employees[0]['name']);
        $this->assertEquals('Chandra', $employees[1]['name']);
        $this->assertEquals('Zackry', $employees[2]['name']);
    }

    public function test_monitoring_attendances_are_sorted_alphabetically()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        // Create active employees with out-of-order names
        Employee::create(['name' => 'Zackry', 'nik' => '10001', 'status' => 'active']);
        Employee::create(['name' => 'Ahmad', 'nik' => '10002', 'status' => 'active']);
        Employee::create(['name' => 'Chandra', 'nik' => '10003', 'status' => 'active']);

        $response = $this->actingAs($user)->get(route('monitoring.attendance'));

        $response->assertStatus(200);

        // Get Inertia page props
        $attendances = $response->original->getData()['page']['props']['attendances'];

        $this->assertCount(3, $attendances);
        $this->assertEquals('Ahmad', $attendances[0]->employee->name);
        $this->assertEquals('Chandra', $attendances[1]->employee->name);
        $this->assertEquals('Zackry', $attendances[2]->employee->name);
    }
}
