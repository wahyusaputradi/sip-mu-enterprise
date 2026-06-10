<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Menampilkan daftar file backup.
     */
    public function index()
    {
        $disk = Storage::disk($this->getDiskName());
        $backupName = config('backup.backup.name');

        $files = [];
        try {
            $files = $disk->files($backupName);
        } catch (\Exception $e) {
            // Folder backup belum ada
        }

        $backups = [];
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                $backups[] = [
                    'name' => str_replace($backupName . '/', '', $file),
                    'path' => $file,
                    'size' => $this->formatBytes($disk->size($file)),
                    'size_raw' => $disk->size($file),
                    'date' => Carbon::createFromTimestamp($disk->lastModified($file))->format('d M Y, H:i'),
                    'timestamp' => $disk->lastModified($file),
                ];
            }
        }

        // Urutkan dari yang terbaru
        usort($backups, fn($a, $b) => $b['timestamp'] - $a['timestamp']);

        // Hitung total ukuran backup
        $totalSize = array_sum(array_column($backups, 'size_raw'));

        return Inertia::render('Settings/Backup', [
            'backups' => $backups,
            'appName' => config('app.name'),
            'totalSize' => $this->formatBytes($totalSize),
            'totalCount' => count($backups),
        ]);
    }

    /**
     * Membuat backup baru (Full: Database + Storage Files).
     */
    public function create(Request $request)
    {
        $type = $request->input('type', 'full'); // 'full' atau 'db-only'

        try {
            // Naikkan batas waktu eksekusi PHP agar backup tidak timeout di Apache
            set_time_limit(300); // 5 menit

            // Hapus cache konfigurasi agar Artisan mengambil config terbaru
            Artisan::call('config:clear');

            if ($type === 'db-only') {
                Artisan::call('backup:run', ['--only-db' => true, '--disable-notifications' => true]);
            } else {
                Artisan::call('backup:run', ['--disable-notifications' => true]);
            }

            $label = $type === 'db-only' ? 'Database' : 'Full (Database + File)';
            return back()->with('message', "Pencadangan {$label} berhasil diselesaikan.");
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Gagal membuat cadangan: ' . $e->getMessage()]);
        }
    }

    /**
     * Download file backup (GET request agar browser bisa download langsung).
     */
    public function download(Request $request)
    {
        $path = $request->query('path');

        if (!$path || !$this->isValidBackupPath($path)) {
            abort(404, 'File backup tidak ditemukan.');
        }

        $disk = Storage::disk($this->getDiskName());

        if ($disk->exists($path)) {
            $fileName = basename($path);
            return response()->download($disk->path($path), $fileName);
        }

        abort(404, 'File backup tidak ditemukan.');
    }

    /**
     * Menghapus file backup.
     */
    public function destroy(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        if (!$this->isValidBackupPath($request->path)) {
            return back()->withErrors(['message' => 'Path file tidak valid.']);
        }

        $disk = Storage::disk($this->getDiskName());

        if ($disk->exists($request->path)) {
            $disk->delete($request->path);
            return back()->with('message', 'File backup berhasil dihapus.');
        }

        return back()->withErrors(['message' => 'File backup tidak ditemukan.']);
    }

    /**
     * Restore database dari file backup.
     */
    public function restoreDatabase(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        if (!$this->isValidBackupPath($request->path)) {
            return back()->withErrors(['message' => 'Path file tidak valid.']);
        }

        $disk = Storage::disk($this->getDiskName());

        if (!$disk->exists($request->path)) {
            return back()->withErrors(['message' => 'File backup tidak ditemukan.']);
        }

        $zipPath = $disk->path($request->path);

        $zip = new \ZipArchive;
        if ($zip->open($zipPath) !== TRUE) {
            return back()->withErrors(['message' => 'Gagal membuka file arsip (zip) cadangan.']);
        }

        // Cari file .sql di dalam zip
        $sqlFileName = null;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            if (preg_match('/\.sql$/i', $filename)) {
                $sqlFileName = $filename;
                break;
            }
        }

        if (!$sqlFileName) {
            $zip->close();
            return back()->withErrors(['message' => 'Tidak ditemukan file database (.sql) di dalam arsip ini.']);
        }

        // Ekstrak ke temp folder
        $tempPath = storage_path('app/temp_restore');
        if (!file_exists($tempPath)) {
            mkdir($tempPath, 0755, true);
        }

        $zip->extractTo($tempPath, $sqlFileName);
        $zip->close();

        $sqlFilePath = $tempPath . DIRECTORY_SEPARATOR . $sqlFileName;

        try {
            // Coba restore via mysql CLI (lebih handal untuk file besar)
            $restored = $this->restoreViaCli($sqlFilePath);

            if (!$restored) {
                // Fallback: gunakan DB::unprepared untuk file kecil
                $sqlContent = file_get_contents($sqlFilePath);
                if (strlen($sqlContent) > 50 * 1024 * 1024) { // > 50MB
                    throw new \Exception('File SQL terlalu besar untuk di-restore via web. Gunakan mysql CLI secara manual.');
                }
                DB::unprepared($sqlContent);
            }

            // Bersihkan temp
            @unlink($sqlFilePath);
            // Hapus subfolder db-dumps jika ada
            $this->cleanTempDir($tempPath);

            return back()->with('message', 'Database berhasil di-restore dari cadangan.');
        } catch (\Exception $e) {
            @unlink($sqlFilePath);
            $this->cleanTempDir($tempPath);
            return back()->withErrors(['message' => 'Gagal memulihkan database: ' . $e->getMessage()]);
        }
    }

    /**
     * Restore database menggunakan mysql CLI (lebih handal untuk file besar).
     */
    private function restoreViaCli(string $sqlFilePath): bool
    {
        $dbConfig = config('database.connections.' . config('database.default'));
        $dumpBinaryPath = $dbConfig['dump']['dump_binary_path'] ?? '';

        // Tentukan path mysql executable
        $mysqlBin = $dumpBinaryPath
            ? rtrim($dumpBinaryPath, '/\\') . DIRECTORY_SEPARATOR . 'mysql'
            : 'mysql';

        // Cek apakah mysql binary tersedia
        if ($dumpBinaryPath && !file_exists($mysqlBin . '.exe') && !file_exists($mysqlBin)) {
            return false;
        }

        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? '3306';
        $database = $dbConfig['database'] ?? '';
        $username = $dbConfig['username'] ?? 'root';
        $password = $dbConfig['password'] ?? '';

        // Bangun command
        $command = sprintf(
            '"%s" --host=%s --port=%s --user=%s %s %s < "%s"',
            $mysqlBin,
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            $password ? '--password=' . escapeshellarg($password) : '',
            escapeshellarg($database),
            $sqlFilePath
        );

        // Eksekusi
        $output = [];
        $returnVar = 0;
        exec($command . ' 2>&1', $output, $returnVar);

        return $returnVar === 0;
    }

    /**
     * Validasi path agar tidak bisa mengakses file di luar folder backup (path traversal prevention).
     */
    private function isValidBackupPath(string $path): bool
    {
        $backupName = config('backup.backup.name');

        // Path harus dimulai dengan nama backup
        if (!str_starts_with($path, $backupName . '/')) {
            return false;
        }

        // Tidak boleh mengandung path traversal
        if (str_contains($path, '..') || str_contains($path, '//')) {
            return false;
        }

        // Harus berekstensi .zip
        if (pathinfo($path, PATHINFO_EXTENSION) !== 'zip') {
            return false;
        }

        return true;
    }

    /**
     * Bersihkan folder temporary restore.
     */
    private function cleanTempDir(string $tempPath): void
    {
        // Hapus subfolder db-dumps/* jika ada
        $dbDumpsDir = $tempPath . DIRECTORY_SEPARATOR . 'db-dumps';
        if (is_dir($dbDumpsDir)) {
            $files = glob($dbDumpsDir . DIRECTORY_SEPARATOR . '*');
            foreach ($files as $file) {
                @unlink($file);
            }
            @rmdir($dbDumpsDir);
        }
        @rmdir($tempPath);
    }

    /**
     * Nama disk backup dari konfigurasi.
     */
    private function getDiskName(): string
    {
        return config('backup.backup.destination.disks')[0] ?? 'local';
    }

    /**
     * Format bytes ke satuan yang mudah dibaca.
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
