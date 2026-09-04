<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    public function headings(): array
    {
        return [
            'NIS (Wajib)*',
            'NISN',
            'Nama Lengkap Siswa (Wajib)*',
            'Jenis Kelamin (Laki-laki / Perempuan)',
            'Nama Kelas (Wajib)*',
            'Nama Orang Tua / Wali',
            'No. HP Orang Tua (WA)',
            'Status (active / graduated / moved)',
        ];
    }

    public function array(): array
    {
        return [
            [
                '2026001',
                '0051234567',
                'Budi Santoso',
                'Laki-laki',
                'X TJKT 1',
                'Bapak Santoso',
                '08123456789',
                'active',
            ],
            [
                '2026002',
                '0051234568',
                'Siti Aminah',
                'Perempuan',
                'X TJKT 1',
                'Ibu Aminah',
                '08198765432',
                'active',
            ],
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
