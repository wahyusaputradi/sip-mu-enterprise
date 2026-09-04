<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\SchoolClass;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class StudentsImport implements ToCollection, WithHeadingRow
{
    public int $successCount = 0;
    public int $updatedCount = 0;
    public int $skippedCount = 0;
    public array $errors = [];

    public function collection(Collection $rows)
    {
        $classes = SchoolClass::all()->keyBy(fn($c) => strtolower(trim($c->name)));

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Heading is row 1

            // Support multiple column header variations
            $nis = trim((string) ($row['nis_wajib'] ?? $row['nis'] ?? ''));
            $nisn = trim((string) ($row['nisn'] ?? ''));
            $name = trim((string) ($row['nama_lengkap_siswa_wajib'] ?? $row['nama_lengkap'] ?? $row['nama'] ?? ''));
            $gender = trim((string) ($row['jenis_kelamin_laki_laki_perempuan'] ?? $row['jenis_kelamin'] ?? 'Laki-laki'));
            $className = trim((string) ($row['nama_kelas_wajib'] ?? $row['nama_kelas'] ?? $row['kelas'] ?? ''));
            $parentName = trim((string) ($row['nama_orang_tua_wali'] ?? $row['nama_orang_tua'] ?? ''));
            $parentPhone = trim((string) ($row['no_hp_orang_tua_wa'] ?? $row['no_hp_orang_tua'] ?? $row['hp'] ?? ''));
            $status = strtolower(trim((string) ($row['status_active_graduated_moved'] ?? $row['status'] ?? 'active')));

            if (empty($nis) || empty($name)) {
                $this->skippedCount++;
                $this->errors[] = "Baris {$rowNum}: NIS atau Nama kosong.";
                continue;
            }

            // Standardize gender
            if (str_starts_with(strtolower($gender), 'p')) {
                $gender = 'Perempuan';
            } else {
                $gender = 'Laki-laki';
            }

            // Standardize status
            if (!in_array($status, ['active', 'graduated', 'moved'])) {
                $status = 'active';
            }

            // Resolve Class ID
            $classId = null;
            if (!empty($className)) {
                $lowerClassName = strtolower($className);
                if (isset($classes[$lowerClassName])) {
                    $classId = $classes[$lowerClassName]->id;
                } else {
                    // Create new class if missing
                    $newClass = SchoolClass::create([
                        'name' => $className,
                        'level' => str_contains($lowerClassName, 'xii') ? 'XII' : (str_contains($lowerClassName, 'xi') ? 'XI' : 'X'),
                    ]);
                    $classes[$lowerClassName] = $newClass;
                    $classId = $newClass->id;
                }
            }

            $existing = Student::where('nis', $nis)->first();

            if ($existing) {
                $existing->update([
                    'nisn' => $nisn ?: $existing->nisn,
                    'name' => $name,
                    'gender' => $gender,
                    'school_class_id' => $classId ?: $existing->school_class_id,
                    'parent_name' => $parentName ?: $existing->parent_name,
                    'parent_phone' => $parentPhone ?: $existing->parent_phone,
                    'status' => $status,
                ]);
                $this->updatedCount++;
            } else {
                Student::create([
                    'nis' => $nis,
                    'nisn' => $nisn ?: null,
                    'name' => $name,
                    'gender' => $gender,
                    'school_class_id' => $classId,
                    'parent_name' => $parentName ?: null,
                    'parent_phone' => $parentPhone ?: null,
                    'qr_token' => Student::generateQrToken($nis),
                    'status' => $status,
                ]);
                $this->successCount++;
            }
        }
    }
}
