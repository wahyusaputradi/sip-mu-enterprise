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
            'Jumlah Pegawai',
        ];
    }

    public function map($position): array
    {
        return [
            $position->id,
            $position->name,
            $position->description,
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
