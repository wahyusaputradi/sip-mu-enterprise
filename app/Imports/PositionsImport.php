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
                ]
            );
        }
    }
}
