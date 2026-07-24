<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Holiday;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HolidayDateRangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_add_single_holiday()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'mode' => 'single',
            'date' => '2026-08-17',
            'description' => 'Hari Kemerdekaan RI',
            'is_national_holiday' => 1,
        ]);

        $response->assertStatus(302);
        
        $exists = Holiday::whereDate('date', '2026-08-17')
            ->where('description', 'Hari Kemerdekaan RI')
            ->where('is_national_holiday', 1)
            ->exists();
        $this->assertTrue($exists);
    }

    public function test_can_add_date_range_holidays()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'mode' => 'range',
            'start_date' => '2026-08-24',
            'end_date' => '2026-08-27',
            'description' => 'Libur Bersama Akhir Pekan',
            'is_national_holiday' => 0,
        ]);

        $response->assertStatus(302);

        // Check if all dates in range are created
        foreach (['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27'] as $date) {
            $exists = Holiday::whereDate('date', $date)
                ->where('description', 'Libur Bersama Akhir Pekan')
                ->where('is_national_holiday', 0)
                ->exists();
            $this->assertTrue($exists);
        }
    }

    public function test_updating_overlapping_date_does_not_fail()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        // Seed an existing holiday
        Holiday::create([
            'date' => \Carbon\Carbon::parse('2026-08-29'),
            'description' => 'Libur Awal',
            'is_national_holiday' => 1,
        ]);

        // Add a range that overlaps with the existing date
        $response = $this->actingAs($user)->post(route('holidays.store'), [
            'mode' => 'range',
            'start_date' => '2026-08-28',
            'end_date' => '2026-08-30',
            'description' => 'Libur Update',
            'is_national_holiday' => 0,
        ]);

        $response->assertStatus(302);

        // Overlapping date should be updated, and others created
        foreach (['2026-08-28', '2026-08-29', '2026-08-30'] as $date) {
            $exists = Holiday::whereDate('date', $date)
                ->where('description', 'Libur Update')
                ->where('is_national_holiday', 0)
                ->exists();
            $this->assertTrue($exists);
        }
    }
}
