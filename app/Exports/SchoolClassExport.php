<?php

namespace App\Exports;

use App\Models\SchoolClass;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SchoolClassExport implements FromCollection, WithHeadings, WithMapping
{
    protected $isTemplate;

    public function __construct($isTemplate = false)
    {
        $this->isTemplate = $isTemplate;
    }

    public function headings(): array
    {
        return [
            'Nama Kelas (Wajib, Contoh: X RPL 1)',
            'Tingkat (Opsional, Contoh: X, XI, XII)',
            'Jurusan (Opsional, Contoh: Rekayasa Perangkat Lunak)',
            'ID Wali Kelas (Opsional, Sesuaikan ID di menu Guru)'
        ];
    }

    public function collection()
    {
        if ($this->isTemplate) {
            return collect([
                [
                    'name' => 'X RPL 1',
                    'level' => 'X',
                    'major' => 'Rekayasa Perangkat Lunak',
                    'homeroom_teacher_id' => ''
                ]
            ]);
        }
        return SchoolClass::with('homeroomTeacher')->orderBy('order')->orderBy('name')->get();
    }

    public function map($schoolClass): array
    {
        if (is_array($schoolClass)) {
            return [
                $schoolClass['name'],
                $schoolClass['level'],
                $schoolClass['major'],
                $schoolClass['homeroom_teacher_id'],
            ];
        }

        return [
            $schoolClass->name,
            $schoolClass->level,
            $schoolClass->major,
            $schoolClass->homeroom_teacher_id,
        ];
    }
}
