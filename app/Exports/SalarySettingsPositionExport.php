<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\Position;
use App\Models\SystemSetting;

class SalarySettingsPositionExport implements FromArray, WithHeadings, WithStyles
{
    protected $month;
    protected $year;
    protected $isTemplate;

    public function __construct($month, $year, $isTemplate = false)
    {
        $this->month = $month;
        $this->year = $year;
        $this->isTemplate = $isTemplate;
    }

    public function array(): array
    {
        $suffix = "_{$this->month}_{$this->year}";
        $positions = Position::orderBy('name', 'asc')->get();
        $data = [];

        foreach ($positions as $pos) {
            $allowance_jabatan = 0;
            $allowance_transport = 0;

            if (!$this->isTemplate) {
                $overrideJabatan = SystemSetting::where('key', "pos_{$pos->id}_allowance_jabatan{$suffix}")->value('value');
                $overrideTransport = SystemSetting::where('key', "pos_{$pos->id}_allowance_transport{$suffix}")->value('value');
                
                $allowance_jabatan = $overrideJabatan !== null ? $overrideJabatan : $pos->allowance_jabatan;
                $allowance_transport = $overrideTransport !== null ? $overrideTransport : $pos->allowance_transport;
            }

            $data[] = [
                $pos->id,
                $pos->name,
                $allowance_jabatan,
                $allowance_transport,
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'ID Jabatan',
            'Nama Jabatan',
            'Tunjangan Jabatan Rp',
            'Tunjangan Transport Rp',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
