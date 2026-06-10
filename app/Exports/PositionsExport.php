<?php

namespace App\Exports;

use App\Models\Position;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PositionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return Position::withCount('employees')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Jabatan',
            'Keterangan',
            'Gaji Pokok',
            'Tarif per Jam',
            'Tarif Inval',
            'Potongan Alpha',
            'Tunjangan Jabatan',
            'Tunjangan Wali Kelas',
            'Tunjangan Sertifikasi',
            'Tunjangan Makan',
            'Tunjangan Transport',
            'Jumlah Pegawai',
        ];
    }

    public function map($position): array
    {
        return [
            $position->id,
            $position->name,
            $position->description,
            $position->base_salary,
            $position->hourly_rate,
            $position->inval_rate,
            $position->alpha_penalty_rate,
            $position->allowance_jabatan,
            $position->allowance_homeroom,
            $position->allowance_certification,
            $position->allowance_lunch,
            $position->allowance_transport,
            $position->employees_count,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
