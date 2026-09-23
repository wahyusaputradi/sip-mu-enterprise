<?php

namespace App\Imports;

use App\Models\ExamSupervisionSchedule;
use App\Models\SchoolClass;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class ExamSupervisionScheduleImport implements ToCollection, WithStartRow
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
                continue;
            }

            $dayOfWeek = $daysMap[$dayName];
            $rowNumber = $index + 2;

            // Loop columns 1 to 4 for Sessions 1 to 4
            for ($sessionNumber = 1; $sessionNumber <= 4; $sessionNumber++) {
                $cellData = trim($row[$sessionNumber] ?? '');

                if (empty($cellData)) {
                    // Empty cell means clear schedule for this session
                    ExamSupervisionSchedule::where('employee_id', $this->employee_id)
                        ->where('day_of_week', $dayOfWeek)
                        ->where('session_number', $sessionNumber)
                        ->delete();
                    continue;
                }

                // Parse room name from parentheses if present e.g. "Matematika / X TJKT-1 (Lab Komputer 1)"
                $roomName = null;
                if (preg_match('/\(([^)]+)\)$/', $cellData, $matches)) {
                    $roomName = trim($matches[1]);
                    $cellData = trim(preg_replace('/\(([^)]+)\)$/', '', $cellData));
                }

                // Parse "Subject / ClassName"
                $parts = preg_split('/[\/\|]/', $cellData);

                $subject = '';
                $className = '';

                if (count($parts) >= 2) {
                    $classNameRaw = array_pop($parts);
                    $subjectRaw = implode('/', $parts);
                    $subject = trim($subjectRaw);
                    $className = trim($classNameRaw);
                } else {
                    // Only subject is provided
                    $subject = trim($cellData);
                }

                if (empty($subject)) {
                    $this->errors[] = "Baris $rowNumber (Hari $dayName, Sesi $sessionNumber): Mata pelajaran ujian tidak boleh kosong.";
                    continue;
                }

                $schoolClassId = null;
                if (!empty($className)) {
                    // Validate class (Exact match first)
                    $schoolClass = SchoolClass::where('name', $className)->first();

                    // If exact match fails, try a normalized match
                    if (!$schoolClass) {
                        $normalizedInput = str_replace([' ', '-'], '', strtolower($className));
                        $schoolClass = SchoolClass::get()->first(function ($c) use ($normalizedInput) {
                            return str_replace([' ', '-'], '', strtolower($c->name)) === $normalizedInput;
                        });
                    }

                    if ($schoolClass) {
                        $schoolClassId = $schoolClass->id;
                    }
                }

                // Check teacher collision on same day & session for other entries
                $teacherCollision = ExamSupervisionSchedule::where('employee_id', $this->employee_id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('session_number', $sessionNumber)
                    ->first();

                // Update or Create
                ExamSupervisionSchedule::updateOrCreate(
                    [
                        'employee_id' => $this->employee_id,
                        'day_of_week' => $dayOfWeek,
                        'session_number' => $sessionNumber,
                    ],
                    [
                        'school_class_id' => $schoolClassId,
                        'subject' => $subject,
                        'room_name' => $roomName ?? ($className ?: null),
                    ]
                );
            }
        }
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
