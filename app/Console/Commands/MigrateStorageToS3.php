<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateStorageToS3 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:migrate-to-s3 {--dry-run : Lakukan simulasi tanpa memindahkan file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Memigrasi semua file gambar/lampiran dari disk public (lokal) ke disk s3 (Object Storage)';

    /**
     * Directories to migrate.
     */
    protected $directories = [
        'employee-photos',
        'attendances/daily',
        'attendances/teaching',
        'leave-attachments'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('--- DRY RUN MODE --- File tidak akan benar-benar dipindahkan.');
        }

        $localDisk = Storage::disk('public');
        
        // Memeriksa apakah disk s3 dikonfigurasi dengan benar
        $s3Disk = Storage::disk('s3');
        if (empty(config('filesystems.disks.s3.key')) || empty(config('filesystems.disks.s3.bucket'))) {
            $this->error('Konfigurasi S3 (AWS_ACCESS_KEY_ID, AWS_BUCKET) belum diatur di .env');
            return Command::FAILURE;
        }

        try {
            // Test koneksi S3 sederhana dengan mencoba mengakses directory
            $s3Disk->directories();
        } catch (\Exception $e) {
            $this->error('Gagal terhubung ke S3: ' . $e->getMessage());
            $this->error('Pastikan AWS_ENDPOINT dan credentials S3 Anda benar.');
            return Command::FAILURE;
        }

        $this->info('Memulai migrasi file dari Local Storage ke S3...');
        
        $totalFiles = 0;
        $totalSuccess = 0;
        $totalFailed = 0;
        $totalSize = 0;

        foreach ($this->directories as $dir) {
            $this->info('');
            $this->info("📁 Direktori: {$dir}");

            if (!$localDisk->exists($dir)) {
                $this->warn("   Direktori tidak ditemukan di local disk, dilewati.");
                continue;
            }

            $files = $localDisk->allFiles($dir);
            $count = count($files);
            
            if ($count === 0) {
                $this->info('   Tidak ada file.');
                continue;
            }

            $this->info("   Menemukan {$count} file.");
            $bar = $this->output->createProgressBar($count);
            $bar->start();

            foreach ($files as $file) {
                $totalFiles++;
                $fileSize = $localDisk->size($file);
                
                if ($dryRun) {
                    $totalSuccess++;
                    $totalSize += $fileSize;
                    $bar->advance();
                    continue;
                }

                try {
                    // Upload ke S3
                    $content = $localDisk->get($file);
                    // Gunakan put dengan stream jika memungkinkan, tapi get() sudah cukup untuk file kecil
                    $uploaded = $s3Disk->put($file, $content);

                    if ($uploaded) {
                        $totalSuccess++;
                        $totalSize += $fileSize;
                    } else {
                        $totalFailed++;
                        $this->error("\n   Gagal mengunggah file: {$file}");
                    }
                } catch (\Exception $e) {
                    $totalFailed++;
                    $this->error("\n   Error pada file {$file}: " . $e->getMessage());
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
        }

        $this->info('');
        $this->info('--- RINGKASAN MIGRASI ---');
        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Total File Ditemukan', $totalFiles],
                ['Berhasil Dipindahkan', $totalSuccess],
                ['Gagal', $totalFailed],
                ['Total Ukuran (Berhasil)', $this->formatBytes($totalSize)],
            ]
        );

        if (!$dryRun && $totalSuccess > 0) {
            $this->info('Migrasi selesai! Semua file yang berhasil diunggah sekarang berada di S3.');
            $this->warn('File asli di local storage TIDAK dihapus otomatis untuk alasan keamanan.');
            $this->warn('Harap verifikasi bahwa aplikasi berjalan normal dengan FILESYSTEM_DISK=s3 sebelum menghapus folder storage/app/public secara manual.');
        }

        return Command::SUCCESS;
    }

    /**
     * Format bytes ke string yang mudah dibaca.
     */
    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
