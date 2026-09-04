<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $classId;
    protected $search;

    public function __construct($classId = null, $search = null)
    {
        $this->classId = $classId;
        $this->search = $search;
    }

    public function collection()
    {
        return Student::with('schoolClass')
            ->when($this->classId, function ($q, $classId) {
                $q->where('school_class_id', $classId);
            })
            ->when($this->search, function ($q, $search) {
                $q->where('name', 'like', "%{$this->search}%")
                  ->orWhere('nis', 'like', "%{$this->search}%")
                  ->orWhere('nisn', 'like', "%{$this->search}%");
            })
            ->orderBy('name')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID Siswa',
            'NIS',
            'NISN',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Kelas / Rombel',
            'Nama Orang Tua',
            'No. HP Orang Tua (WA)',
            'Status',
            'Token QR Code',
        ];
    }

    public function map($student): array
    {
        return [
            $student->id,
            $student->nis,
            $student->nisn ?? '-',
            $student->name,
            $student->gender ?? 'Laki-laki',
            $student->schoolClass?->name ?? '-',
            $student->parent_name ?? '-',
            $student->parent_phone ?? '-',
            $student->status === 'active' ? 'Aktif' : $student->status,
            $student->qr_token,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'], // Indigo 600
                ],
            ],
        ];
    }
}
