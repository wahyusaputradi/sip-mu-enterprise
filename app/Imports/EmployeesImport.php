<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\User;
use App\Models\Position;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class EmployeesImport implements ToCollection
{
    /**
     * Track import results for feedback.
     */
    public int $successCount = 0;
    public int $updatedCount = 0;
    public int $skippedCount = 0;
    public array $errors = [];

    /**
     * Column mapping — order MUST match the template exactly.
     * 0: NIK, 1: NIK Kependudukan, 2: NUPTK, 3: Nama Lengkap,
     * 4: Jenis Kelamin, 5: Tempat Lahir, 6: Tanggal Lahir,
     * 7: Email Login, 8: No WhatsApp, 9: Jabatan,
     * 10: Tanggal Mulai Kerja, 11: Ijazah Terakhir, 12: Bidang Studi,
     * 13: Jam KBM, 14: Status Sertifikasi, 15: Wali Kelas (Y/T), 16: Kelas Wali,
     * 17: Pembina Eskul (Y/T), 18: Nama Eskul, 19: Status
     */
    public function collection(Collection $rows)
    {
        $headerRowIndex = -1;

        foreach ($rows as $index => $row) {
            // --- Step 1: Find header row dynamically ---
            // Look for a row where the first cell is literally "NIK"
            $firstCell = isset($row[0]) ? Str::upper(trim($row[0])) : '';
            if ($firstCell === 'NIK') {
                $headerRowIndex = $index;
                continue;
            }

            // Skip everything before header is found
            if ($headerRowIndex === -1) {
                continue;
            }

            // Skip empty rows (NIK column empty)
            $nik = trim($row[0] ?? '');
            if (empty($nik)) {
                continue;
            }

            // --- Step 2: Extract cell values ---
            $rowNumber = $index + 1; // human-readable row number for error reporting

            try {
                DB::beginTransaction();

                $nikKependudukan = $this->clean($row[1] ?? null);
                $nuptk            = $this->clean($row[2] ?? null);
                $name             = !empty($row[3]) ? trim($row[3]) : 'Pegawai Baru';
                $gender           = $this->parseGender($row[4] ?? '');
                $birthPlace       = $this->clean($row[5] ?? null);
                $birthDate        = $this->parseDate($row[6] ?? null);
                $email            = $this->clean($row[7] ?? null);
                $phone            = $this->clean($row[8] ?? null);
                $jabatanRaw       = $this->clean($row[9] ?? null);
                $joinDate         = $this->parseDate($row[10] ?? null);
                $education        = $this->clean($row[11] ?? null);
                $subject          = $this->clean($row[12] ?? null);
                $teachingHours    = is_numeric($row[13] ?? null) ? (int) $row[13] : null;
                $isCertified      = (Str::lower(trim($row[14] ?? '')) === 'sertifikasi');
                $isHomeroom       = $this->parseBoolean($row[15] ?? 'T');
                $homeroomClass    = $isHomeroom ? $this->clean($row[16] ?? null) : null;
                $isExtracurricular = $this->parseBoolean($row[17] ?? 'T');
                $extracurricularName = $isExtracurricular ? $this->clean($row[18] ?? null) : null;
                $status           = $this->parseStatus($row[19] ?? 'Aktif');

                // --- Step 3: Handle User Account ---
                if (empty($email)) {
                    $slug = Str::slug($name, '');
                    $baseEmail = $slug . '@smkmu.sch.id';
                    // Ensure uniqueness
                    $email = $baseEmail;
                    $counter = 1;
                    while (User::where('email', $email)->exists()) {
                        $email = $slug . $counter . '@smkmu.sch.id';
                        $counter++;
                    }
                }

                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name'     => $name,
                        'password' => Hash::make('password'),
                    ]
                );

                // Assign role safely
                $roleName = (stripos($jabatanRaw ?? '', 'Guru') !== false) ? 'Guru' : 'Karyawan';
                try {
                    $roleExists = \Spatie\Permission\Models\Role::where('name', $roleName)->exists();
                    if ($roleExists && !$user->hasRole($roleName)) {
                        $user->assignRole($roleName);
                    }
                } catch (\Exception $e) {
                    // Role assignment is non-critical
                }

                // --- Step 4: Handle Position mapping ---
                $positionId = null;
                if (!empty($jabatanRaw)) {
                    $position = Position::where('name', $jabatanRaw)->first()
                             ?? Position::where('name', 'like', '%' . $jabatanRaw . '%')->first();
                    if ($position) {
                        $positionId = $position->id;
                    }
                }
                // Fallback to first available position if no match
                if (!$positionId) {
                    $positionId = Position::first()?->id ?? 1;
                }

                // --- Step 5: Upsert Employee ---
                $isNew = !Employee::where('nik', $nik)->exists();

                $employee = Employee::updateOrCreate(
                    ['nik' => $nik],
                    [
                        'user_id'                  => $user->id,
                        'nik_kependudukan'         => $nikKependudukan,
                        'nuptk'                    => $nuptk,
                        'name'                     => $name,
                        'birth_place'              => $birthPlace,
                        'birth_date'               => $birthDate,
                        'gender'                   => $gender,
                        'phone'                    => $phone,
                        'join_date'                => $joinDate,
                        'education'                => $education,
                        'subject'                  => $subject,
                        'teaching_hours'           => $teachingHours,
                        'is_certified'             => $isCertified,
                        'is_homeroom_teacher'      => $isHomeroom,
                        'homeroom_class'           => $homeroomClass,
                        'is_extracurricular_builder' => $isExtracurricular,
                        'extracurricular_name'     => $extracurricularName,
                        'status'                   => $status,
                    ]
                );

                // Sync position (Many-to-Many pivot)
                $employee->positions()->sync([$positionId => ['is_primary' => true]]);

                DB::commit();

                if ($isNew) {
                    $this->successCount++;
                } else {
                    $this->updatedCount++;
                }

            } catch (\Exception $e) {
                DB::rollBack();
                $this->skippedCount++;
                $this->errors[] = "Baris {$rowNumber} (NIK: {$nik}): " . $e->getMessage();
                Log::warning("EmployeesImport error at row {$rowNumber}", [
                    'nik'   => $nik,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    // ─── Helper Methods ─────────────────────────────────────────

    private function clean($value): ?string
    {
        if ($value === null || $value === '') return null;
        return trim((string) $value);
    }

    private function parseGender(string $raw): string
    {
        $val = Str::lower(trim($raw));
        return ($val === 'perempuan' || $val === 'p') ? 'Perempuan' : 'Laki-laki';
    }

    private function parseStatus(string $raw): string
    {
        $val = Str::lower(trim($raw));
        return in_array($val, ['non-aktif', 'nonaktif', 'inactive', 'tidak aktif']) ? 'inactive' : 'active';
    }

    private function parseDate($value): ?string
    {
        if (empty($value)) return null;

        // Excel serial date number
        if (is_numeric($value)) {
            try {
                return Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }

        // String date (YYYY-MM-DD, DD/MM/YYYY, etc.)
        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseBoolean($value): bool
    {
        $val = Str::lower(trim((string) $value));
        return in_array($val, ['y', 'ya', '1', 'true', 'yes']);
    }
}
