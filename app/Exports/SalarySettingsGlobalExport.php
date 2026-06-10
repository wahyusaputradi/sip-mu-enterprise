<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\SystemSetting;

class SalarySettingsGlobalExport implements FromArray, WithHeadings, WithStyles
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
        $globalKeys = [
            'allowance_homeroom' => 'Tunjangan Wali Kelas',
            'allowance_ekskul_osis' => 'Pembina OSIS',
            'allowance_ekskul_polsis' => 'Pembina Polsis',
            'allowance_ekskul_pramuka' => 'Pembina Pramuka',
            'allowance_ekskul_seni' => 'Pembina Seni',
            'allowance_ekskul_paskibra' => 'Pembina Paskibra',
            'allowance_ekskul_rohis' => 'Pembina Rohis',
            'base_salary_per_hour' => 'Tarif Gaji Pokok (Rp/Jam)',
            'substitute_allowance_per_hour' => 'Tarif Insentif Jam Ganti (Rp/Jam)',
            'absence_deduction_per_hour' => 'Tarif Potongan Absensi/Alpha (Rp/Jam)',
        ];

        $suffix = "_{$this->month}_{$this->year}";
        $data = [];

        foreach ($globalKeys as $key => $desc) {
            $value = 0;
            if (!$this->isTemplate) {
                $override = SystemSetting::where('key', $key . $suffix)->value('value');
                $master = SystemSetting::where('key', $key)->value('value') ?? 0;
                $value = $override !== null ? $override : $master;
            }
            $data[] = [
                $key,
                $desc,
                $value
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Kode Pengaturan',
            'Deskripsi',
            'Nilai Rp',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
