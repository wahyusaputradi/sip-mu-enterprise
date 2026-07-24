<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\CampusLocation;
use App\Models\Attendance;
use App\Models\SystemSetting;
use App\Models\SchoolClass;
use App\Models\TeachingSchedule;
use App\Models\TeachingAttendance;
use App\Models\LeaveRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class AttendanceDinasLuarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed default roles
        Role::create(['name' => 'Super Admin']);
    }

    protected function createEmployeeUser(): array
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'nik' => '99887766',
            'name' => 'Guru Dinas Luar',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);
        return [$user, $employee];
    }

    public function test_dinas_luar_bypasses_checkin_radius_and_timing()
    {
        [$user, $employee] = $this->createEmployeeUser();

        $campus = CampusLocation::create([
            'name' => 'Kampus Pusat',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100, // 100 meters
        ]);

        // Configure system settings
        SystemSetting::updateOrCreate(['key' => 'jam_masuk'], ['value' => '07:00']);
        SystemSetting::updateOrCreate(['key' => 'batas_waktu_maksimal_terlambat'], ['value' => '10']);

        // Create an approved Dinas Luar leave request for today
        LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => 'izin_dinas_luar',
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today(),
            'reason' => 'Tugas Dinas Luar Kota',
            'status' => 'approved',
        ]);

        // Try checking in far away (e.g. -7.500000, 110.500000) and way past 07:10 (mocking time as 09:30)
        Carbon::setTestNow(Carbon::today()->setTime(9, 30, 0));

        $response = $this->actingAs($user)
            ->post(route('attendance.check-in'), [
                'latitude' => -7.500000,
                'longitude' => 110.500000,
                'campus_location_id' => $campus->id,
                'photo' => 'data:image/jpeg;base64,invalidbase64contentplaceholder',
            ]);

        $response->assertSessionHasNoErrors();
        
        $attendance = Attendance::where('employee_id', $employee->id)->first();
        $this->assertNotNull($attendance);
        $this->assertTrue($attendance->is_dinas_luar);
        $this->assertEquals('present', $attendance->status);

        Carbon::setTestNow();
    }

    public function test_dinas_luar_bypasses_checkout_constraints()
    {
        [$user, $employee] = $this->createEmployeeUser();

        $campus = CampusLocation::create([
            'name' => 'Kampus Pusat',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
        ]);

        SystemSetting::updateOrCreate(['key' => 'jam_keluar'], ['value' => '14:40']);

        // Create an approved Dinas Luar leave request
        LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => 'izin_dinas_luar',
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today(),
            'reason' => 'Tugas Dinas Luar Kota',
            'status' => 'approved',
        ]);

        // Pre-create check-in
        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date' => Carbon::today(),
            'check_in' => '07:30:00',
            'latitude' => -7.500000,
            'longitude' => 110.500000,
            'campus_location_id' => $campus->id,
            'status' => 'present',
            'is_dinas_luar' => true,
        ]);

        // Try checking out early (e.g. at 12:00) far away
        Carbon::setTestNow(Carbon::today()->setTime(12, 0, 0));

        $response = $this->actingAs($user)
            ->post(route('attendance.check-out'), [
                'latitude' => -7.500000,
                'longitude' => 110.500000,
                'campus_location_id' => $campus->id,
                'photo' => 'data:image/jpeg;base64,invalidbase64contentplaceholder',
            ]);

        $response->assertSessionHasNoErrors();
        
        $attendance->refresh();
        $this->assertNotNull($attendance->check_out);
        $this->assertTrue($attendance->is_dinas_luar);

        Carbon::setTestNow();
    }

    public function test_dinas_luar_bypasses_teaching_attendance_constraints()
    {
        [$user, $employee] = $this->createEmployeeUser();

        $campus = CampusLocation::create([
            'name' => 'Kampus Pusat',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
        ]);

        $schoolClass = SchoolClass::create(['name' => 'Kelas X A']);
        
        // Mocks a schedule for today's day of week
        $todayDow = Carbon::today()->dayOfWeekIso;
        
        $schedule = TeachingSchedule::create([
            'employee_id' => $employee->id,
            'school_class_id' => $schoolClass->id,
            'day_of_week' => $todayDow,
            'hour_number' => 1,
            'subject' => 'Matematika',
        ]);

        SystemSetting::updateOrCreate(['key' => 'batas_waktu_maksimal_terlambat'], ['value' => '10']);

        // Create approved Dinas Luar
        LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => 'izin_dinas_luar',
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today(),
            'reason' => 'Dinas Luar',
            'status' => 'approved',
        ]);

        // Try checking in far away and after the deadline (Jam 1 starts at 07:00, checking in at 08:30)
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        $response = $this->actingAs($user)
            ->post(route('attendance.guru'), [
                'teaching_schedule_id' => $schedule->id,
                'latitude' => -7.500000,
                'longitude' => 110.500000,
                'campus_location_id' => $campus->id,
                'photo' => 'data:image/jpeg;base64,invalidbase64contentplaceholder',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('teaching_attendances', [
            'employee_id' => $employee->id,
            'teaching_schedule_id' => $schedule->id,
            'is_dinas_luar' => true,
            'status' => 'present',
        ]);

        // It should also create a daily attendance with is_dinas_luar => true
        $daily = Attendance::where('employee_id', $employee->id)->first();
        $this->assertNotNull($daily);
        $this->assertTrue($daily->is_dinas_luar);

        Carbon::setTestNow();
    }
}
