<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\AttendanceUnlock;
use App\Models\CampusLocation;
use App\Models\Attendance;
use App\Models\SystemSetting;
use App\Models\SchoolClass;
use App\Models\TeachingSchedule;
use App\Models\TeachingAttendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class AttendanceUnlockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed default roles
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Absensi']);
    }

    protected function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');
        return $user;
    }

    public function test_unlock_attendance_validation_and_creation()
    {
        $admin = $this->createAdminUser();
        $targetUser = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $targetUser->id,
            'nik' => '12345678',
            'name' => 'Test Employee',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->post(route('attendance.unlock'), [
                'employee_id' => $employee->id,
                'type' => 'daily_checkin',
                'reason' => 'Late tolerance test',
                'expires_in_minutes' => 15,
                'is_lateness_violation' => false,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('attendance_unlocks', [
            'employee_id' => $employee->id,
            'type' => 'daily_checkin',
            'is_lateness_violation' => false,
            'used' => false,
        ]);
    }

    public function test_daily_checkin_past_deadline_with_lateness_tolerance_marked_present()
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'nik' => '87654321',
            'name' => 'Guru Test',
            'gender' => 'Perempuan',
            'status' => 'active',
        ]);

        $campus = CampusLocation::create([
            'name' => 'Kampus Utama',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
        ]);

        // Configure system settings
        SystemSetting::updateOrCreate(['key' => 'jam_masuk'], ['value' => '07:00']);
        SystemSetting::updateOrCreate(['key' => 'batas_waktu_maksimal_terlambat'], ['value' => '10']);

        // Mock current time to be past deadline (e.g. 07:30)
        Carbon::setTestNow(Carbon::today()->setHour(7)->setMinute(30));

        // Create an unlock with is_lateness_violation = false (exempt from lateness)
        $admin = $this->createAdminUser();
        $unlock = AttendanceUnlock::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'type' => 'daily_checkin',
            'unlocked_by' => $admin->id,
            'reason' => 'Late tolerance bypass',
            'is_lateness_violation' => false,
            'expires_at' => Carbon::now()->addMinutes(30),
            'used' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('attendance.check-in'), [
                'latitude' => -6.200000,
                'longitude' => 106.816666,
                'campus_location_id' => $campus->id,
                'photo' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // 1x1 pixel image
            ]);

        $response->assertSessionHasNoErrors();
        
        // Assert attendance was created with status 'present' (on time) instead of 'late'
        $this->assertDatabaseHas('attendances', [
            'employee_id' => $employee->id,
            'status' => 'present',
        ]);

        // Assert unlock is marked as used
        $this->assertTrue($unlock->fresh()->used);

        Carbon::setTestNow(); // Reset time mocking
    }

    public function test_teaching_attendance_past_deadline_with_lateness_tolerance_marked_present()
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'nik' => '11223344',
            'name' => 'Dosen Test',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);

        $campus = CampusLocation::create([
            'name' => 'Kampus 2',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
        ]);

        $schoolClass = SchoolClass::create([
            'name' => '10-A',
        ]);

        $schedule = TeachingSchedule::create([
            'employee_id' => $employee->id,
            'school_class_id' => $schoolClass->id,
            'day_of_week' => Carbon::now()->dayOfWeekIso,
            'hour_number' => 1,
            'subject' => 'Matematika',
            'campus_location_id' => $campus->id,
        ]);

        // Configure system settings
        SystemSetting::updateOrCreate(['key' => 'batas_waktu_maksimal_terlambat'], ['value' => '10']);

        // Mock current time to be past deadline of 1st slot.
        // Hour slot 1 is 07:00 - 07:40, deadline at 07:10 (since limit is 10 min).
        // Let's mock time to 07:15.
        Carbon::setTestNow(Carbon::today()->setHour(7)->setMinute(15));

        // Create unlock for teaching attendance
        $admin = $this->createAdminUser();
        $unlock = AttendanceUnlock::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'type' => 'teaching',
            'teaching_schedule_id' => $schedule->id,
            'unlocked_by' => $admin->id,
            'reason' => 'Late tolerance bypass teaching',
            'is_lateness_violation' => false,
            'expires_at' => Carbon::now()->addMinutes(30),
            'used' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('attendance.guru'), [
                'teaching_schedule_id' => $schedule->id,
                'campus_location_id' => $campus->id,
                'latitude' => -6.200000,
                'longitude' => 106.816666,
                'photo' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            ]);

        $response->assertSessionHasNoErrors();

        // Assert teaching attendance is saved with 'present' status
        $this->assertDatabaseHas('teaching_attendances', [
            'employee_id' => $employee->id,
            'teaching_schedule_id' => $schedule->id,
            'status' => 'present',
        ]);

        // Assert unlock token is used
        $this->assertTrue($unlock->fresh()->used);

        Carbon::setTestNow();
    }

    public function test_can_re_unlock_when_previous_unlock_has_expired()
    {
        $admin = $this->createAdminUser();
        $targetUser = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $targetUser->id,
            'nik' => '12345678',
            'name' => 'Test Employee',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);

        // Create an expired unlock
        AttendanceUnlock::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'type' => 'daily_checkin',
            'unlocked_by' => $admin->id,
            'reason' => 'First unlock',
            'is_lateness_violation' => false,
            'expires_at' => Carbon::now()->subMinutes(5), // Already expired
            'used' => false,
        ]);

        // Try to unlock again
        $response = $this->actingAs($admin)
            ->post(route('attendance.unlock'), [
                'employee_id' => $employee->id,
                'type' => 'daily_checkin',
                'reason' => 'Second unlock after expired',
                'expires_in_minutes' => 15,
                'is_lateness_violation' => false,
            ]);

        $response->assertSessionHasNoErrors();
        
        // Assert we have 2 unlock records in database
        $this->assertEquals(2, AttendanceUnlock::where('employee_id', $employee->id)->count());
    }

    public function test_cannot_re_unlock_when_previous_unlock_is_still_active()
    {
        $admin = $this->createAdminUser();
        $targetUser = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $targetUser->id,
            'nik' => '12345678',
            'name' => 'Test Employee',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);

        // Create an active unlock
        AttendanceUnlock::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'type' => 'daily_checkin',
            'unlocked_by' => $admin->id,
            'reason' => 'First unlock',
            'is_lateness_violation' => false,
            'expires_at' => Carbon::now()->addMinutes(15), // Still active
            'used' => false,
        ]);

        // Try to unlock again
        $response = $this->actingAs($admin)
            ->post(route('attendance.unlock'), [
                'employee_id' => $employee->id,
                'type' => 'daily_checkin',
                'reason' => 'Second unlock attempting duplicate',
                'expires_in_minutes' => 15,
                'is_lateness_violation' => false,
            ]);

        $response->assertSessionHasErrors(['message']);
        
        // Assert we only have 1 unlock record in database
        $this->assertEquals(1, AttendanceUnlock::where('employee_id', $employee->id)->count());
    }
}

