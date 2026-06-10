<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\SystemSetting;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SalarySettingsEmployeeImport implements ToCollection, WithHeadingRow
{
    protected $month;
    protected $year;

    public function __construct($month, $year)
    {
        $this->month = $month;
        $this->year = $year;
    }

    public function collection(Collection $rows)
    {
        $suffix = "_{$this->month}_{$this->year}";

        foreach ($rows as $row) {
            $empId = $row['id_pegawai'] ?? null;
            if (!$empId) continue;

            $emp = Employee::find($empId);
            if (!$emp) continue;

            $bpjs = $row['potongan_bpjs_rp'] ?? 0;
            $koperasi = $row['potongan_koperasi_rp'] ?? 0;
            $sekolah = $row['pinjaman_sekolah_rp'] ?? 0;
            $bmt = $row['pinjaman_bmt_rp'] ?? 0;

            SystemSetting::updateOrCreate(
                ['key' => "emp_{$emp->id}_bpjs_deduction{$suffix}"],
                ['value' => is_numeric($bpjs) ? $bpjs : 0]
            );

            SystemSetting::updateOrCreate(
                ['key' => "emp_{$emp->id}_cooperative_deduction{$suffix}"],
                ['value' => is_numeric($koperasi) ? $koperasi : 0]
            );

            SystemSetting::updateOrCreate(
                ['key' => "emp_{$emp->id}_school_loan{$suffix}"],
                ['value' => is_numeric($sekolah) ? $sekolah : 0]
            );

            SystemSetting::updateOrCreate(
                ['key' => "emp_{$emp->id}_bmt_loan{$suffix}"],
                ['value' => is_numeric($bmt) ? $bmt : 0]
            );
        }
    }
}
