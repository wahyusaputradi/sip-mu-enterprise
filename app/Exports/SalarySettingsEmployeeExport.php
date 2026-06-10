<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\Employee;
use App\Models\SystemSetting;

class SalarySettingsEmployeeExport implements FromArray, WithHeadings, WithStyles
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
        $employees = Employee::orderBy('name', 'asc')->get();
        $data = [];

        foreach ($employees as $emp) {
            $bpjs_deduction = 0;
            $cooperative_deduction = 0;
            $school_loan = 0;
            $bmt_loan = 0;

            if (!$this->isTemplate) {
                $keys = ['bpjs_deduction', 'cooperative_deduction', 'school_loan', 'bmt_loan'];
                $values = [];
                foreach ($keys as $k) {
                    $override = SystemSetting::where('key', "emp_{$emp->id}_{$k}{$suffix}")->value('value');
                    $values[$k] = $override !== null ? $override : $emp->{$k};
                }
                
                $bpjs_deduction = $values['bpjs_deduction'] ?? 0;
                $cooperative_deduction = $values['cooperative_deduction'] ?? 0;
                $school_loan = $values['school_loan'] ?? 0;
                $bmt_loan = $values['bmt_loan'] ?? 0;
            }

            $data[] = [
                $emp->id,
                $emp->name,
                $bpjs_deduction,
                $cooperative_deduction,
                $school_loan,
                $bmt_loan,
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'ID Pegawai',
            'Nama Pegawai',
            'Potongan BPJS Rp',
            'Potongan Koperasi Rp',
            'Pinjaman Sekolah Rp',
            'Pinjaman BMT Rp',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
