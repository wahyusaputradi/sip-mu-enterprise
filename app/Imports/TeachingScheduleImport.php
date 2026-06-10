<?php

namespace App\Imports;

use App\Models\TeachingSchedule;
use App\Models\SchoolClass;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class TeachingScheduleImport implements ToCollection, WithStartRow
{
    protected $employee_id;
    protected $errors = [];

    public function __construct($employee_id)
    {
        $this->employee_id = $employee_id;
    }

    public function startRow(): int
    {
        return 2; // Skip heading, start at data (Senin)
    }

    public function collection(Collection $rows)
    {
        $daysMap = [
            'Senin' => 1,
            'Selasa' => 2,
            'Rabu' => 3,
            'Kamis' => 4,
            'Jumat' => 5
        ];

        // Process only first 5 rows (the days)
        $dataRows = $rows->take(5);

        foreach ($dataRows as $index => $row) {
            $dayName = trim($row[0] ?? '');
            
            if (!isset($daysMap[$dayName])) {
                // If it doesn't match standard day name, it might be an empty row or instructions, skip
                continue;
            }
            
            $dayOfWeek = $daysMap[$dayName];
            $rowNumber = $index + 2;

            // Loop columns 1 to 10 for hours 1 to 10
            for ($hourNumber = 1; $hourNumber <= 10; $hourNumber++) {
                $cellData = trim($row[$hourNumber] ?? '');

                if (empty($cellData)) {
                    // Empty cell means no schedule, or they want to clear it
                    TeachingSchedule::where('employee_id', $this->employee_id)
                        ->where('day_of_week', $dayOfWeek)
                        ->where('hour_number', $hourNumber)
                        ->delete();
                    continue;
                }

                // Parse "Subject / ClassName"
                // Only split by "/" or "|" to avoid breaking class names that contain hyphens (e.g. "X TJKT-3")
                $parts = preg_split('/[\/\|]/', $cellData);
                
                if (count($parts) < 2) {
                    $this->errors[] = "Baris $rowNumber (Hari $dayName, Jam $hourNumber): Format tidak valid. Harus berisi 'Mata Pelajaran / Nama Kelas' (Contoh: 'KKA / X TJKT-3').";
                    continue;
                }

                $classNameRaw = array_pop($parts);
                $subjectRaw = implode('/', $parts); // Recombine if there were multiple slashes in subject

                $subject = trim($subjectRaw);
                $className = trim($classNameRaw);

                if (empty($subject) || empty($className)) {
                    $this->errors[] = "Baris $rowNumber (Hari $dayName, Jam $hourNumber): Mata pelajaran atau Kelas tidak boleh kosong.";
                    continue;
                }

                // Validate class (Exact match first)
                $schoolClass = SchoolClass::where('name', $className)->first();
                
                // If exact match fails, try a normalized match (ignoring spaces and dashes)
                if (!$schoolClass) {
                    $normalizedInput = str_replace([' ', '-'], '', strtolower($className));
                    $schoolClass = SchoolClass::get()->first(function($c) use ($normalizedInput) {
                        return str_replace([' ', '-'], '', strtolower($c->name)) === $normalizedInput;
                    });
                }

                if (!$schoolClass) {
                    $this->errors[] = "Baris $rowNumber (Hari $dayName, Jam $hourNumber): Kelas '$className' tidak ditemukan di sistem.";
                    continue;
                }

                // Check class collision (different teacher using same class slot)
                $classCollision = TeachingSchedule::where('school_class_id', $schoolClass->id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('hour_number', $hourNumber)
                    ->where('employee_id', '!=', $this->employee_id)
                    ->first();

                if ($classCollision) {
                    $this->errors[] = "Baris $rowNumber (Hari $dayName, Jam $hourNumber): Kelas '$className' sudah terisi oleh guru lain.";
                    continue;
                }

                // Update or Create
                TeachingSchedule::updateOrCreate(
                    [
                        'employee_id' => $this->employee_id,
                        'day_of_week' => $dayOfWeek,
                        'hour_number' => $hourNumber,
                    ],
                    [
                        'school_class_id' => $schoolClass->id,
                        'subject' => $subject,
                    ]
                );
            }
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
