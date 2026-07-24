<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\TeachingSchedule;
use App\Models\SubstituteTeaching;
use App\Models\Holiday;
use App\Models\SystemSetting;
use App\Models\SchoolClass;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollCalculatorTest extends TestCase
{
    use RefreshDatabase;

    private PayrollService $payrollService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->payrollService = new PayrollService();
    }

    public function test_scenario_1_normal_teaching_hours_calculation()
    {
        // 1. Create a teacher & school class
        $teacher = Employee::create([
            'nik' => '12345678',
            'name' => 'Guru Mulia',
            'status' => 'active',
        ]);

        $class = SchoolClass::create([
            'name' => 'X-RPL',
            'level' => 'X',
            'major' => 'RPL',
        ]);

        // 2. Add 24 JTM schedule (e.g. 6 hours each on Monday, Tuesday, Wednesday, Thursday)
        for ($day = 1; $day <= 4; $day++) {
            for ($hour = 1; $hour <= 6; $hour++) {
                TeachingSchedule::create([
                    'employee_id' => $teacher->id,
                    'school_class_id' => $class->id,
                    'day_of_week' => $day,
                    'hour_number' => $hour,
                    'subject' => 'Math',
                ]);
            }
        }

        // 3. Set global settings
        SystemSetting::create(['key' => 'base_salary_per_hour', 'value' => 15000]);

        // 4. Calculate for October 2026
        // October 2026 has:
        // Mon: 4, Tue: 4, Wed: 4, Thu: 5
        // Expected: (4 * 6) + (4 * 6) + (4 * 6) + (5 * 6) = 102 hours
        $payroll = $this->payrollService->calculateEmployeePayroll($teacher, 10, 2026);

        $this->assertEquals(102, $payroll->details['metadata']['teaching_hours']);
        $this->assertEquals(102 * 15000, $payroll->gross_salary);
        $this->assertEquals(102 * 15000, $payroll->net_salary);
    }

    public function test_scenario_2_leave_transferred_to_substitute()
    {
        // 1. Create primary teacher, substitute teacher, and class
        $teacher = Employee::create([
            'nik' => '12345678',
            'name' => 'Guru Mulia',
            'status' => 'active',
        ]);

        $substitute = Employee::create([
            'nik' => '87654321',
            'name' => 'Guru Inval',
            'status' => 'active',
        ]);

        $class = SchoolClass::create([
            'name' => 'X-RPL',
            'level' => 'X',
            'major' => 'RPL',
        ]);

        // 2. Add 24 JTM schedule to primary teacher (6 hours on Monday)
        for ($hour = 1; $hour <= 6; $hour++) {
            TeachingSchedule::create([
                'employee_id' => $teacher->id,
                'school_class_id' => $class->id,
                'day_of_week' => 1, // Monday
                'hour_number' => $hour,
                'subject' => 'Math',
            ]);
        }

        // October 2026 has 4 Mondays: Oct 5, 12, 19, 26
        // Total expected normal hours = 4 * 6 = 24 JTM

        // 3. Teacher takes leave on Oct 5 (Monday), which is substituted for 4 hours by Guru Inval
        // We create 4 approved substitute teachings
        $schedules = TeachingSchedule::where('employee_id', $teacher->id)->take(4)->get();
        foreach ($schedules as $sched) {
            SubstituteTeaching::create([
                'date' => '2026-10-05',
                'absent_employee_id' => $teacher->id,
                'substitute_employee_id' => $substitute->id,
                'teaching_schedule_id' => $sched->id,
                'status' => 'approved',
            ]);
        }

        // 4. Set global settings
        SystemSetting::create(['key' => 'base_salary_per_hour', 'value' => 15000]);
        SystemSetting::create(['key' => 'substitute_allowance_per_hour', 'value' => 20000]);

        // 5. Calculate Payroll for both
        $payrollTeacher = $this->payrollService->calculateEmployeePayroll($teacher, 10, 2026);
        $payrollSub = $this->payrollService->calculateEmployeePayroll($substitute, 10, 2026);

        // Teacher should have: 24 total - 4 substituted = 20 teaching hours
        $this->assertEquals(20, $payrollTeacher->details['metadata']['teaching_hours']);
        $this->assertEquals(20 * 15000, $payrollTeacher->gross_salary);

        // Substitute should have: 4 inval hours
        $this->assertEquals(4, $payrollSub->details['metadata']['inval_hours']);
        $this->assertEquals(4 * 20000, $payrollSub->gross_salary);
    }

    public function test_scenario_3_holiday_compensation()
    {
        // 1. Create a teacher & class
        $teacher = Employee::create([
            'nik' => '12345678',
            'name' => 'Guru Mulia',
            'status' => 'active',
        ]);

        $class = SchoolClass::create([
            'name' => 'X-RPL',
            'level' => 'X',
            'major' => 'RPL',
        ]);

        // 2. Add schedule: 6 hours on Monday
        for ($hour = 1; $hour <= 6; $hour++) {
            TeachingSchedule::create([
                'employee_id' => $teacher->id,
                'school_class_id' => $class->id,
                'day_of_week' => 1, // Monday
                'hour_number' => $hour,
                'subject' => 'Math',
            ]);
        }

        // October 2026 has 4 Mondays: Oct 5, 12, 19, 26

        // 3. Mark Oct 12 as holiday (Libur Sekolah)
        Holiday::create([
            'date' => '2026-10-12',
            'description' => 'Libur Maulid Nabi',
            'is_national_holiday' => 1,
        ]);

        // 4. Set global settings (including holiday compensation rate of 7500/hour)
        SystemSetting::create(['key' => 'base_salary_per_hour', 'value' => 15000]);
        SystemSetting::create(['key' => 'holiday_salary_per_hour', 'value' => 7500]);

        // 5. Calculate payroll
        $payroll = $this->payrollService->calculateEmployeePayroll($teacher, 10, 2026);

        // Monday Oct 12 is holiday (6 hours lost to holiday)
        // Mondays Oct 5, 19, 26 are effective (18 hours effective)
        $this->assertEquals(18, $payroll->details['metadata']['teaching_hours']);
        $this->assertEquals(6, $payroll->details['metadata']['holiday_hours']);

        // Earnings: (18 * 15000) + (6 * 7500) = 270000 + 45000 = 315000
        $this->assertEquals(315000, $payroll->gross_salary);
    }
}
