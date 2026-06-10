<?php

namespace App\Imports;

use App\Models\SystemSetting;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SalarySettingsGlobalImport implements ToCollection, WithHeadingRow
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
        $validKeys = [
            'allowance_homeroom', 'allowance_ekskul_osis', 'allowance_ekskul_polsis',
            'allowance_ekskul_pramuka', 'allowance_ekskul_seni', 'allowance_ekskul_paskibra',
            'allowance_ekskul_rohis', 'base_salary_per_hour', 'substitute_allowance_per_hour',
            'absence_deduction_per_hour'
        ];

        foreach ($rows as $row) {
            $key = $row['kode_pengaturan'] ?? null;
            $value = $row['nilai_rp'] ?? 0;

            if ($key && in_array($key, $validKeys)) {
                SystemSetting::updateOrCreate(
                    ['key' => $key . $suffix],
                    ['value' => is_numeric($value) ? $value : 0]
                );
                
                // Also update the master default to ensure changes are carried over if no overrides exist in the future
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => is_numeric($value) ? $value : 0]
                );
            }
        }
    }
}
