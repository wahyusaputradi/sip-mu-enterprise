<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\TeachingAttendance;
use App\Services\ImageCompressionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CompressExistingImages extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'images:compress-existing
                            {--type=all : Tipe gambar yang akan dikompresi (all, profile, attendance)}
                            {--dry-run : Simulasi tanpa benar-benar mengompresi}';

    /**
     * The console command description.
     */
    protected $description = 'Kompresi ulang semua foto yang sudah ada di storage (profil pegawai & presensi)';

    public function handle(): int
    {
        $type = $this->option('type');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 Mode DRY-RUN aktif — tidak ada file yang akan diubah.');
        }

        $compressor = app(ImageCompressionService::class);

        $totalOriginal = 0;
        $totalCompressed = 0;
        $totalFiles = 0;
        $totalSuccess = 0;

        // ── Profile Photos ──
        if (in_array($type, ['all', 'profile'])) {
            $this->info('');
            $this->info('📷 Memproses foto profil pegawai...');

            $employees = Employee::whereNotNull('photo_path')->get();
            $bar = $this->output->createProgressBar($employees->count());
            $bar->start();

            foreach ($employees as $employee) {
                $totalFiles++;

                if ($dryRun) {
                    $disk = config('filesystems.default', 'public');
                    if (Storage::disk($disk)->exists($employee->photo_path)) {
                        $size = Storage::disk($disk)->size($employee->photo_path);
                        $totalOriginal += $size;
                        $totalCompressed += (int)($size * 0.3); // Estimasi 70% hemat
                    }
                    $bar->advance();
                    continue;
                }

                $result = $compressor->compressExistingFile($employee->photo_path, 'profile');

                if ($result['success']) {
                    $totalSuccess++;
                    $totalOriginal += $result['original_size'];
                    $totalCompressed += $result['compressed_size'];

                    // Update DB if path changed (extension change)
                    if (isset($result['new_path']) && $result['new_path'] !== $employee->photo_path) {
                        $employee->update(['photo_path' => $result['new_path']]);
                    }
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("   ✅ {$employees->count()} foto profil diproses.");
        }

        // ── Teaching Attendance Photos ──
        if (in_array($type, ['all', 'attendance'])) {
            $this->info('');
            $this->info('📸 Memproses foto presensi mengajar...');

            $attendances = TeachingAttendance::whereNotNull('photo')
                ->where('photo', 'like', 'attendances/%')
                ->get();

            $bar = $this->output->createProgressBar($attendances->count());
            $bar->start();

            foreach ($attendances as $attendance) {
                $totalFiles++;

                if ($dryRun) {
                    $disk = config('filesystems.default', 'public');
                    if (Storage::disk($disk)->exists($attendance->photo)) {
                        $size = Storage::disk($disk)->size($attendance->photo);
                        $totalOriginal += $size;
                        $totalCompressed += (int)($size * 0.25); // Estimasi 75% hemat
                    }
                    $bar->advance();
                    continue;
                }

                $result = $compressor->compressExistingFile($attendance->photo, 'attendance');

                if ($result['success']) {
                    $totalSuccess++;
                    $totalOriginal += $result['original_size'];
                    $totalCompressed += $result['compressed_size'];

                    // Update DB if path changed
                    if (isset($result['new_path']) && $result['new_path'] !== $attendance->photo) {
                        $attendance->update(['photo' => $result['new_path']]);
                    }
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("   ✅ {$attendances->count()} foto presensi diproses.");
        }

        // ── Summary ──
        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('📊 RINGKASAN KOMPRESI');
        $this->info('═══════════════════════════════════════════');
        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Total file diproses', $totalFiles],
                ['Berhasil dikompresi', $dryRun ? 'N/A (dry-run)' : $totalSuccess],
                ['Ukuran asli', $this->formatBytes($totalOriginal)],
                ['Ukuran setelah kompresi', $dryRun ? "~{$this->formatBytes($totalCompressed)} (estimasi)" : $this->formatBytes($totalCompressed)],
                ['Storage dihemat', $this->formatBytes($totalOriginal - $totalCompressed)],
                ['Persentase hemat', $totalOriginal > 0 ? round((1 - $totalCompressed / $totalOriginal) * 100, 1) . '%' : '0%'],
            ]
        );

        if ($dryRun) {
            $this->warn('');
            $this->warn('⚠️  Ini adalah simulasi DRY-RUN. Jalankan tanpa --dry-run untuk benar-benar mengompresi.');
        }

        return Command::SUCCESS;
    }

    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
