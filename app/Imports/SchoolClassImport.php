<?php

namespace App\Imports;

use App\Models\SchoolClass;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class SchoolClassImport implements ToCollection, WithStartRow
{
    public function startRow(): int
    {
        return 2; // Skip heading
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $name = $row[0];
            $level = $row[1] ?? null;
            $major = $row[2] ?? null;
            $homeroom_teacher_id = $row[3] ?? null;

            if (empty($name)) {
                continue;
            }

            // Verify teacher exists if ID is provided
            if ($homeroom_teacher_id) {
                $teacherExists = \App\Models\Employee::where('id', $homeroom_teacher_id)->exists();
                if (!$teacherExists) {
                    $homeroom_teacher_id = null;
                }
            } else {
                $homeroom_teacher_id = null;
            }

            SchoolClass::updateOrCreate(
                ['name' => $name],
                [
                    'level' => $level,
                    'major' => $major,
                    'homeroom_teacher_id' => $homeroom_teacher_id,
                ]
            );
        }
    }
}
