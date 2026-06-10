<?php

namespace App\Imports;

use App\Models\Position;
use App\Models\SystemSetting;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SalarySettingsPositionImport implements ToCollection, WithHeadingRow
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
            $posId = $row['id_jabatan'] ?? null;
            if (!$posId) continue;

            $pos = Position::find($posId);
            if (!$pos) continue;

            $allowance_jabatan = $row['tunjangan_jabatan_rp'] ?? 0;
            $allowance_transport = $row['tunjangan_transport_rp'] ?? 0;

            SystemSetting::updateOrCreate(
                ['key' => "pos_{$pos->id}_allowance_jabatan{$suffix}"],
                ['value' => is_numeric($allowance_jabatan) ? $allowance_jabatan : 0]
            );

            SystemSetting::updateOrCreate(
                ['key' => "pos_{$pos->id}_allowance_transport{$suffix}"],
                ['value' => is_numeric($allowance_transport) ? $allowance_transport : 0]
            );
        }
    }
}
