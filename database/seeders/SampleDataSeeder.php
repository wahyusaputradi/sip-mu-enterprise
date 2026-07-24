<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\CampusLocation;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Sample Campus Location
        CampusLocation::firstOrCreate(
            ['name' => 'SMK Manbaul Ulum Main'],
            [
                'latitude' => -6.74627100,
                'longitude' => 108.48729100,
                'radius' => 100,
            ]
        );

        // 2. Create Sample Positions
        $positions = [
            [
                'name' => 'Guru Tetap',
                'description' => 'Guru pengampu mata pelajaran reguler',
            ],
            [
                'name' => 'Waka Kurikulum',
                'description' => 'Wakil kepala sekolah bidang kurikulum',
            ],
        ];

        foreach ($positions as $pos) {
            Position::updateOrCreate(['name' => $pos['name']], $pos);
        }

        $guruPos = Position::where('name', 'Guru Tetap')->first();
        $wakaPos = Position::where('name', 'Waka Kurikulum')->first();

        // 3. Create Sample Employees & Users
        $employeesData = [
            [
                'name' => 'Ahmad Fauzi, S.Pd',
                'nik' => '19850101202001',
                'email' => 'ahmad@sipmu.com',
                'position_id' => $guruPos->id,
                'role' => 'Guru / Karyawan Staf',
                'is_homeroom_teacher' => true,
                'homeroom_class' => 'X-RPL-1',
            ],
            [
                'name' => 'Siti Aminah, M.Pd',
                'nik' => '19820510201502',
                'email' => 'siti@sipmu.com',
                'position_id' => $wakaPos->id,
                'role' => 'Kurikulum / Admin',
                'is_homeroom_teacher' => false,
            ],
        ];

        foreach ($employeesData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                ]
            );
            
            // Check if role exists before assigning
            if ($user->roles()->count() == 0) {
                 try { $user->assignRole($data['role']); } catch (\Exception $e) {}
            }

            $employee = Employee::updateOrCreate(
                ['nik' => $data['nik']],
                [
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'status' => 'active',
                    'is_homeroom_teacher' => $data['is_homeroom_teacher'],
                    'homeroom_class' => $data['homeroom_class'] ?? null,
                ]
            );

            // Sync position with is_primary = true
            $employee->positions()->sync([
                $data['position_id'] => ['is_primary' => true]
            ]);
        }

        // 4. Create Sample Attendance for current month
        $ahmad = Employee::where('nik', '19850101202001')->first();
        if ($ahmad) {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->subDay();

            Attendance::where('employee_id', $ahmad->id)->delete();

            for ($date = (clone $startDate); $date->lte($endDate); $date->addDay()) {
                if ($date->isWeekend()) continue;

                $isAlpha = rand(1, 15) === 1;
                
                if ($isAlpha) {
                    Attendance::create([
                        'employee_id' => $ahmad->id,
                        'date' => $date->toDateString(),
                        'status' => 'alpha',
                        'teaching_hours' => 0,
                    ]);
                } else {
                    Attendance::create([
                        'employee_id' => $ahmad->id,
                        'date' => $date->toDateString(),
                        'check_in' => '06:55:00',
                        'check_out' => '15:30:00',
                        'latitude' => -6.74627100,
                        'longitude' => 108.48729100,
                        'status' => 'present',
                        'teaching_hours' => 6,
                    ]);
                }
            }
        }
    }
}
