<?php

namespace App\Imports;

use App\Models\Position;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PositionsImport implements ToCollection, WithHeadingRow
{
    public function headingRow(): int
    {
        return 4;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Skip empty rows (must have Nama Jabatan)
            if (empty($row['nama_jabatan'])) {
                continue;
            }

            Position::updateOrCreate(
                ['name' => trim($row['nama_jabatan'])],
                [
                    'description' => $row['keterangan'] ?? null,
                    'base_salary' => is_numeric($row['gaji_pokok']) ? $row['gaji_pokok'] : 0,
                    'hourly_rate' => is_numeric($row['tarif_per_jam']) ? $row['tarif_per_jam'] : 0,
                    'inval_rate' => is_numeric($row['tarif_inval']) ? $row['tarif_inval'] : 0,
                    'alpha_penalty_rate' => is_numeric($row['potongan_alpha']) ? $row['potongan_alpha'] : 0,
                    'allowance_jabatan' => is_numeric($row['tunjangan_jabatan']) ? $row['tunjangan_jabatan'] : 0,
                    'allowance_homeroom' => is_numeric($row['tunjangan_wali_kelas']) ? $row['tunjangan_wali_kelas'] : 0,
                    'allowance_certification' => is_numeric($row['tunjangan_sertifikasi']) ? $row['tunjangan_sertifikasi'] : 0,
                    'allowance_lunch' => is_numeric($row['tunjangan_makan']) ? $row['tunjangan_makan'] : 0,
                    'allowance_transport' => is_numeric($row['tunjangan_transport']) ? $row['tunjangan_transport'] : 0,
                ]
            );
        }
    }
}
