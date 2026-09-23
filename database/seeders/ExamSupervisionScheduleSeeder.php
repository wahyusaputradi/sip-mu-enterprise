<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;
use App\Models\SchoolClass;
use App\Models\ExamSupervisionSchedule;

class ExamSupervisionScheduleSeeder extends Seeder
{
    public function run()
    {
        // Bersihkan data lama
        ExamSupervisionSchedule::truncate();

        // 1. Mapping ID Pengawas ke Nama di Database
        $rawSupervisors = [
            1 => 'Didi Wahyudi', 2 => 'Nurhayati, M.M', 3 => 'Sumarna Indra P.', 4 => 'Umar Ali', 5 => 'Kusnadi',
            6 => 'Rohayati, S.T', 7 => 'Muhamad Jaenudin', 8 => 'Ai Lina Siti', 9 => 'Susiyani Ary', 10 => 'Imas Gandasari',
            11 => 'Yayat Hidayatullah', 12 => 'Sri Ratna Istiqomah', 13 => 'Holly Rahmalia', 14 => 'Irmayani', 15 => 'Siti Rohana',
            16 => 'Madiki', 17 => 'Novi Nurhanipah', 18 => 'Fika Fihriyyah', 19 => 'Ifam Afwani', 20 => 'Evi Fatmawati',
            21 => 'Laela Khaerunisa', 22 => 'Muhammad Iqbal Yafi', 23 => 'M. Joharudin', 24 => 'Ayu Rengganie', 25 => 'Yesa Salamah',
            26 => 'Dince Trisnawati', 27 => 'Rini Mega Agustin', 28 => 'Eva Purwanengsih', 29 => 'Raudhotul Ma\'wa', 30 => 'Abdi Mubarok',
            31 => 'Neneng Nuraeni', 32 => 'Ahmad Maroghi', 33 => 'Mamnun', 34 => 'Devi Dathiah', 35 => 'Ika Aprilianti',
            36 => 'Imas Mega Nanda', 37 => 'Nasih Ilwani', 38 => 'M. Nuruddin', 39 => 'Sukron Ma\'mun', 40 => 'Ayu Marlina',
            41 => 'Irvan Azizy', 42 => 'Wahyu Adi Saputra', 43 => 'Nurlaeli', 44 => 'Nizar Khuzairrul', 45 => 'Selma Salsabila',
            46 => 'Atinisari', 47 => 'Saeful Rohman', 48 => 'Ahmad Izzatal', 49 => 'Windi Permata Sari', 50 => 'Kris Maulana',
            51 => 'Muhamad Jaedi', 52 => 'Mohamad Fika Wafa', 53 => 'Oky Setiawan', 54 => 'Leman, S.Pd', 55 => 'Satrio Wicaksono',
            56 => 'Asna Maziyah', 57 => 'Zahrotul Fikri', 58 => 'Titin Kristiani', 59 => 'Magfiroh', 60 => 'Siti Nurhayati',
            61 => 'Lida Adefia', 62 => 'Paisal', 63 => 'Nurul Hikmah', 64 => 'Venny Koerunnisa', 65 => 'Lubby Daniel',
            66 => 'Iyay Fazriah', 67 => 'Tuti Alawiyah', 68 => 'Astri Yuliantiningsih', 69 => 'Selvi Ramadhani', 70 => 'Erik Ferdiansyah'
        ];

        $employeeMap = [];
        $employees = Employee::all();
        foreach ($rawSupervisors as $id => $name) {
            $nameKey = explode(',', $name)[0]; // Ambil nama depan saja untuk dicocokkan
            $emp = $employees->first(function($e) use ($nameKey) {
                return stripos($e->name, $nameKey) !== false;
            });
            if ($emp) {
                $employeeMap[$id] = $emp->id;
            } else {
                echo "Warning: Employee not found for ID $id ($name)\n";
            }
        }

        // 2. Data Ruangan, Kelas
        $rooms = [
            'R. 01' => '10 BUSANA', 'R. 02' => '10 TFM', 'R. 03' => '11 TFM', 'R. 04' => '10 TJKT-1',
            'R. 05' => '12 TJKT-1', 'R. 06' => '11 TJKT-1', 'R. 07' => '10 MPB-1', 'R. 08' => '10 MPB-2',
            'R. 09' => '11 MPB-1', 'R. 10' => '11 MPB-2', 'R. 11' => '10 BCP', 'R. 12' => '11 BCP',
            'R. 13' => '11 BUSANA', 'R. 14' => '12 TFM-1', 'R. 15' => '12 TFM-2', 'R. 16' => '10 TJKT-2',
            'R. 17' => '10 TJKT-3', 'R. 18' => '10 TJKT-4', 'R. 19' => '10 PM-1', 'R. 20' => '10 PM-2',
            'R. 21' => '11 PM-1', 'R. 22' => '11 PM-2', 'R. 23' => '11 TJKT-2', 'R. 24' => '11 TJKT-3',
            'R. 25' => '11 TJKT-4', 'Susulan 1' => '12 PM-1', 'Susulan 2' => '12 PM-2', 'Susulan 3' => '12 TJKT-2',
            'Susulan 4' => '12 TJKT-3', 'Susulan 5' => '12 TJKT-4', 'Susulan 6' => '12 BCP', 'Susulan 7' => '12 MPB-1',
            'Susulan 8' => '12 MPB-2', 'Susulan 9' => '12 DKV'
        ];

        // 3. Matrix Jadwal (Day, Session, Room -> Supervisor ID)
        $scheduleMatrix = [
            // KAMPUS 1
            ['Senin', 1, [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]],
            ['Senin', 2, [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]],
            ['Senin', 3, [60, 59, 58, 57, 56, 55, 53, 54, 52, 51, 50, 49, 48, 47, 46]],
            ['Senin', 4, [null, null, 58, null, null, 55, null, null, 52, 51, null, 49, 48, 47, 46]],
            ['Selasa', 1, [45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31]],
            ['Selasa', 2, [45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31]],
            ['Selasa', 3, [31, 32, 33, 34, 35, 36, 38, 37, 39, 40, 41, 42, 43, 44, 45]],
            ['Selasa', 4, [null, null, null, null, null, null, null, null, null, null, null, null, null, 44, 45]],
            ['Rabu', 1, [66, 67, 68, 69, 70, 1, 2, 28, 4, 5, 14, 7, 8, 9, 10]],
            ['Rabu', 2, [66, 67, 68, 69, 70, 1, 2, 28, 4, 5, 14, 7, 8, 9, 10]],
            ['Rabu', 3, [1, 2, 28, 4, null, 14, 7, 8, 9, 10, 66, 67, 68, null, null]],
            ['Rabu', 4, [null, null, null, null, null, null, 7, 8, 9, 10, null, null, null, null, null]],
            ['Kamis', 1, [65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51]],
            ['Kamis', 2, [65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51]],
            ['Kamis', 3, [null, 51, 56, null, 53, 52, null, null, 54, 55, null, null, null, null, null]],
            ['Kamis', 4, [null, null, null, null, null, null, null, null, 54, 55, null, null, null, null, null]],
            ['Jumat', 1, [20, 15, 16, 17, 18, 19, 14, 21, 22, 23, 24, 25, 26, 27, 3]],
            ['Jumat', 2, [20, 15, 16, 17, 18, 19, 14, 21, 22, 23, 24, 25, 26, 27, 3]],

            // KAMPUS 2 (Mulai dari R. 16 sampai Susulan 5, array length = 15)
            // Wait, Kampus 2 rooms from left to right:
            // R.16, R.17, R.18, R.19, R.20, R.21, R.22, R.23, R.24, R.25, 
            // Susulan (12 PM-1), Susulan (12 PM-2), Susulan (12 TJKT -2), Susulan (12 TJKT -3), Susulan (12 TJKT -4)
        ];

        $kampus2Matrix = [
            ['Senin', 1, [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, null, null, null, null, null]],
            ['Senin', 2, [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, null, null, null, null, null]],
            ['Senin', 3, [70, 69, 68, 67, 66, 65, 64, 63, 62, 61, null, null, null, null, null]],
            ['Senin', 4, [null, null, null, null, null, 65, 64, 63, 62, 61, null, null, null, null, null]],
            ['Selasa', 1, [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, null, null, null, null, null]],
            ['Selasa', 2, [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, null, null, null, null, null]],
            ['Selasa', 3, [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, null, null, null, null, null]],
            ['Selasa', 4, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]],
            ['Rabu', 1, [11, 12, 13, 6, 15, 16, 17, 18, 19, 20, null, null, null, null, null]],
            ['Rabu', 2, [11, 12, 13, 6, 15, 16, 17, 18, 19, 20, null, null, null, null, null]],
            ['Rabu', 3, [20, 19, 18, 17, 16, 15, 6, 13, 12, 11, null, null, null, null, null]],
            ['Kamis', 1, [50, 49, 48, 47, 46, 45, 43, 42, 41, 40, null, null, null, null, null]],
            ['Kamis', 2, [50, 49, 48, 47, 46, 45, 43, 42, 41, 40, null, null, null, null, null]],
            ['Kamis', 3, [null, null, null, null, null, 46, 47, 48, 49, 50, null, null, null, null, null]],
            ['Jumat', 1, [29, 30, 31, 32, 34, 35, 36, 37, 38, 39, null, null, null, null, null]],
            ['Jumat', 2, [29, 30, 31, 32, 34, 35, 36, 37, 38, 39, null, null, null, null, null]],
        ];

        $kampus1Rooms = [
            'R. 01', 'R. 02', 'R. 03', 'R. 04', 'R. 05', 'R. 06', 'R. 07', 'R. 08', 'R. 09', 'R. 10', 'R. 11', 'R. 12', 'R. 13', 'R. 14', 'R. 15'
        ];

        $kampus2Rooms = [
            'R. 16', 'R. 17', 'R. 18', 'R. 19', 'R. 20', 'R. 21', 'R. 22', 'R. 23', 'R. 24', 'R. 25', 'Susulan 1', 'Susulan 2', 'Susulan 3', 'Susulan 4', 'Susulan 5'
        ];

        $dayMap = ['Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4, 'Jumat' => 5];
        $classes = SchoolClass::all();

        // Helper function
        $processMatrix = function($matrix, $roomNames) use ($employeeMap, $rooms, $classes, $dayMap) {
            foreach ($matrix as $row) {
                $dayStr = $row[0];
                $session = $row[1];
                $supervisorIds = $row[2];

                foreach ($supervisorIds as $idx => $supId) {
                    if (!$supId) continue;
                    
                    if (!isset($employeeMap[$supId])) continue;
                    $employeeId = $employeeMap[$supId];
                    
                    $roomName = $roomNames[$idx];
                    $className = $rooms[$roomName] ?? null;
                    
                    $classId = null;
                    if ($className) {
                        $cls = $classes->first(function($c) use ($className) {
                            return strcasecmp($c->name, $className) === 0;
                        });
                        if ($cls) $classId = $cls->id;
                    }

                    // Tentukan Subject (Generik atau bisa diperbaiki manual)
                    $subject = "PTS Ganjil - Sesi $session";

                    ExamSupervisionSchedule::create([
                        'employee_id' => $employeeId,
                        'school_class_id' => $classId,
                        'day_of_week' => $dayMap[$dayStr],
                        'session_number' => $session,
                        'subject' => $subject,
                        'room_name' => $roomName
                    ]);
                }
            }
        };

        $processMatrix($scheduleMatrix, $kampus1Rooms);
        $processMatrix($kampus2Matrix, $kampus2Rooms);

        echo "Seeding completed successfully.\n";
    }
}
