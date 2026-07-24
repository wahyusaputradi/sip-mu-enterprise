<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\TeachingAttendance;
use App\Models\CampusLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AttendancePhotoController extends Controller
{
    /**
     * Display a listing of attendance photos.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $search = $request->input('search');
        $campusId = $request->input('campus_location_id');
        $photoType = $request->input('photo_type', 'all');

        // Query Daily Attendance with targeted column selection & lightweight eager loading
        $dailyQuery = Attendance::select(['id', 'employee_id', 'date', 'check_in', 'check_out', 'photo_check_in', 'photo_check_out', 'latitude', 'longitude', 'campus_location_id'])
            ->with(['employee:id,name,nik', 'campusLocation:id,name'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($search) {
            $dailyQuery->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        if ($campusId) {
            $dailyQuery->where('campus_location_id', $campusId);
        }

        // Query Teaching Attendance with targeted column selection & lightweight eager loading
        $teachingQuery = TeachingAttendance::select(['id', 'employee_id', 'date', 'time', 'photo', 'latitude', 'longitude', 'campus_location_id', 'teaching_schedule_id'])
            ->with(['employee:id,name,nik', 'campusLocation:id,name', 'teachingSchedule:id,school_class_id,hour_number,subject', 'teachingSchedule.schoolClass:id,name'])
            ->whereBetween('date', [$startDate, $endDate]);


        if ($search) {
            $teachingQuery->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        if ($campusId) {
            $teachingQuery->where('campus_location_id', $campusId);
        }

        $photos = collect();
        $disk = config('filesystems.default', 'public');
        $totalSizeFiltered = 0;
        $activePhotoCount = 0;

        // Fetch daily records
        if ($photoType === 'all' || $photoType === 'daily_in' || $photoType === 'daily_out') {
            $dailyRecords = $dailyQuery->get();
            foreach ($dailyRecords as $record) {
                if (($photoType === 'all' || $photoType === 'daily_in') && $record->photo_check_in) {
                    $activePhotoCount++;
                    $photos->push([
                        'id' => $record->id,
                        'unique_key' => "daily_in_{$record->id}",
                        'type' => 'daily_in',
                        'type_label' => 'Presensi Masuk',
                        'employee_name' => $record->employee->name ?? 'Pegawai',
                        'employee_nip' => $record->employee->nip ?? $record->employee->nik ?? '-',
                        'date' => $record->date,
                        'time' => $record->check_in ? Carbon::parse($record->check_in)->format('H:i') : '-',
                        'photo_path' => $record->photo_check_in,
                        'photo_url' => $record->photo_check_in_url,
                        'latitude' => $record->latitude,
                        'longitude' => $record->longitude,
                        'campus_name' => $record->campusLocation->name ?? '-',
                        'description' => 'Presensi Harian Masuk',
                        'size_bytes' => 0,
                        'size_human' => '-',
                    ]);
                }
                if (($photoType === 'all' || $photoType === 'daily_out') && $record->photo_check_out) {
                    $activePhotoCount++;
                    $photos->push([
                        'id' => $record->id,
                        'unique_key' => "daily_out_{$record->id}",
                        'type' => 'daily_out',
                        'type_label' => 'Presensi Pulang',
                        'employee_name' => $record->employee->name ?? 'Pegawai',
                        'employee_nip' => $record->employee->nip ?? $record->employee->nik ?? '-',
                        'date' => $record->date,
                        'time' => $record->check_out ? Carbon::parse($record->check_out)->format('H:i') : '-',
                        'photo_path' => $record->photo_check_out,
                        'photo_url' => $record->photo_check_out_url,
                        'latitude' => $record->latitude,
                        'longitude' => $record->longitude,
                        'campus_name' => $record->campusLocation->name ?? '-',
                        'description' => 'Presensi Harian Pulang',
                        'size_bytes' => 0,
                        'size_human' => '-',
                    ]);
                }
            }
        }

        // Fetch teaching records
        if ($photoType === 'all' || $photoType === 'teaching') {
            $teachingRecords = $teachingQuery->get();
            foreach ($teachingRecords as $record) {
                if ($record->photo) {
                    $activePhotoCount++;
                    $className = $record->teachingSchedule->schoolClass->name ?? '-';
                    $hourNumber = $record->teachingSchedule->hour_number ?? '-';
                    $subject = $record->teachingSchedule->subject ?? '-';

                    $photos->push([
                        'id' => $record->id,
                        'unique_key' => "teaching_{$record->id}",
                        'type' => 'teaching',
                        'type_label' => "Mengajar Jam {$hourNumber}",
                        'hour_number' => $hourNumber,
                        'employee_name' => $record->employee->name ?? 'Guru',
                        'employee_nip' => $record->employee->nip ?? $record->employee->nik ?? '-',
                        'date' => $record->date,
                        'time' => $record->time ? Carbon::parse($record->time)->format('H:i') : '-',
                        'photo_path' => $record->photo,
                        'photo_url' => $record->photo_url,
                        'latitude' => $record->latitude,
                        'longitude' => $record->longitude,
                        'campus_name' => $record->campusLocation->name ?? '-',
                        'description' => "Kelas {$className} • {$subject}",
                        'size_bytes' => 0,
                        'size_human' => '-',
                    ]);
                }
            }
        }

        // Sort by date and time descending
        $photos = $photos->sortByDesc(function ($item) {
            return $item['date'] . ' ' . $item['time'];
        })->values();

        // Pagination
        $perPage = (int) $request->input('per_page', 12);
        if (!in_array($perPage, [12, 24, 50, 100])) {
            $perPage = 12;
        }

        $page = LengthAwarePaginator::resolveCurrentPage();
        $currentPageSearchResults = $photos->slice(($page - 1) * $perPage, $perPage)->values();

        // ONLY compute file sizes for current visible page items to avoid N+1 Storage I/O bottleneck
        $currentPageSearchResults->transform(function ($item) use ($disk, &$totalSizeFiltered) {
            $path = $item['photo_path'] ?? '';
            if (!empty($path)) {
                $size = 0;
                if (Storage::disk($disk)->exists($path)) {
                    $size = Storage::disk($disk)->size($path);
                } elseif (Storage::disk('public')->exists($path)) {
                    $size = Storage::disk('public')->size($path);
                } elseif (file_exists(storage_path('app/public/' . $path))) {
                    $size = filesize(storage_path('app/public/' . $path));
                }
                
                if ($size > 0) {
                    $item['size_bytes'] = $size;
                    $item['size_human'] = $this->formatBytes($size);
                    $totalSizeFiltered += $size;
                }
            }
            return $item;
        });

        $paginatedPhotos = new LengthAwarePaginator(
            $currentPageSearchResults,
            $photos->count(),
            $perPage,
            $page,
            ['path' => LengthAwarePaginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        $campusLocations = CampusLocation::all();

        return Inertia::render('Monitoring/AttendancePhotos', [
            'photos' => $paginatedPhotos,
            'campusLocations' => $campusLocations,
            'stats' => [
                'total_count' => $activePhotoCount,
                'total_size_human' => $this->formatBytes($totalSizeFiltered),
                'total_size_bytes' => $totalSizeFiltered,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
                'campus_location_id' => $campusId,
                'photo_type' => $photoType,
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Download selected photos compiled into a ZIP file.
     */
    public function downloadZip(Request $request)
    {
        @set_time_limit(300);
        @ini_set('memory_limit', '512M');

        $request->validate([
            'photos' => 'required|array',
            'photos.*.photo_path' => 'required|string',
            'photos.*.type' => 'required|string',
            'photos.*.employee_name' => 'required|string',
            'photos.*.date' => 'required|string',
        ]);

        $selectedPhotos = $request->input('photos');

        $storagePublicDir = storage_path('app/public');
        \Illuminate\Support\Facades\File::ensureDirectoryExists($storagePublicDir);

        $zipFileName = 'foto_presensi_' . time() . '_' . Str::random(5) . '.zip';
        $zipFilePath = $storagePublicDir . '/' . $zipFileName;

        $zip = new \ZipArchive();
        if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Gagal membuat berkas kompresi ZIP di server.'], 500);
        }

        $disk = config('filesystems.default', 'public');
        $addedCount = 0;

        foreach ($selectedPhotos as $photo) {
            $path = $photo['photo_path'] ?? null;
            if (!$path) continue;

            $fileContent = null;
            try {
                if (Storage::disk($disk)->exists($path)) {
                    $fileContent = Storage::disk($disk)->get($path);
                } elseif (Storage::disk('public')->exists($path)) {
                    $fileContent = Storage::disk('public')->get($path);
                } elseif (Storage::disk('local')->exists($path)) {
                    $fileContent = Storage::disk('local')->get($path);
                } elseif (file_exists(storage_path('app/public/' . $path))) {
                    $fileContent = file_get_contents(storage_path('app/public/' . $path));
                } elseif (file_exists(public_path('storage/' . $path))) {
                    $fileContent = file_get_contents(public_path('storage/' . $path));
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Could not read photo for ZIP: {$path}. Error: " . $e->getMessage());
            }

            if ($fileContent) {
                $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg';
                $empName = Str::slug($photo['employee_name'] ?? 'pegawai', '_');
                $dateStr = $photo['date'] ?? date('Y-m-d');
                
                $folder = 'lainnya';
                $filename = "{$dateStr}_{$empName}.{$ext}";

                if (($photo['type'] ?? '') === 'daily_in') {
                    $folder = 'presensi_harian/masuk';
                } elseif (($photo['type'] ?? '') === 'daily_out') {
                    $folder = 'presensi_harian/pulang';
                } elseif (($photo['type'] ?? '') === 'teaching') {
                    $hour = $photo['hour_number'] ?? 'x';
                    $folder = "presensi_mengajar/jam_ke_{$hour}";
                    $filename = "{$dateStr}_{$empName}_jam_{$hour}.{$ext}";
                }

                $zip->addFromString("{$folder}/{$filename}", $fileContent);
                $addedCount++;
            }
        }

        $zip->close();

        if ($addedCount === 0) {
            if (file_exists($zipFilePath)) {
                @unlink($zipFilePath);
            }
            return response()->json(['message' => 'Tidak ada berkas foto yang berhasil ditemukan di penyimpanan server.'], 404);
        }

        return response()->download($zipFilePath, 'Unduh_Foto_Presensi_' . Carbon::now()->format('d_M_Y_H_i') . '.zip')->deleteFileAfterSend(true);
    }



    /**
     * Delete a single photo.
     */
    public function destroy($type, $id)
    {
        $disk = config('filesystems.default', 'public');
        $deleted = false;
        
        if ($type === 'daily_in') {
            $attendance = Attendance::findOrFail($id);
            if ($attendance->photo_check_in) {
                if (Storage::disk($disk)->exists($attendance->photo_check_in)) {
                    Storage::disk($disk)->delete($attendance->photo_check_in);
                }
                $attendance->update(['photo_check_in' => null]);
                $deleted = true;
            }
        } elseif ($type === 'daily_out') {
            $attendance = Attendance::findOrFail($id);
            if ($attendance->photo_check_out) {
                if (Storage::disk($disk)->exists($attendance->photo_check_out)) {
                    Storage::disk($disk)->delete($attendance->photo_check_out);
                }
                $attendance->update(['photo_check_out' => null]);
                $deleted = true;
            }
        } elseif ($type === 'teaching') {
            $teaching = TeachingAttendance::findOrFail($id);
            if ($teaching->photo) {
                if (Storage::disk($disk)->exists($teaching->photo)) {
                    Storage::disk($disk)->delete($teaching->photo);
                }
                $teaching->update(['photo' => null]);
                $deleted = true;
            }
        }

        if ($deleted) {
            return back()->with('message', 'Foto presensi berhasil dihapus.');
        }

        return back()->withErrors(['message' => 'Foto presensi tidak ditemukan atau sudah dihapus.']);
    }

    /**
     * Delete multiple selected photos.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'photos' => 'required|array',
            'photos.*.id' => 'required|integer',
            'photos.*.type' => 'required|string',
        ]);

        $photosToDelete = $request->input('photos');
        $disk = config('filesystems.default', 'public');
        $deletedCount = 0;

        foreach ($photosToDelete as $photo) {
            $id = $photo['id'];
            $type = $photo['type'];

            if ($type === 'daily_in') {
                $attendance = Attendance::find($id);
                if ($attendance && $attendance->photo_check_in) {
                    if (Storage::disk($disk)->exists($attendance->photo_check_in)) {
                        Storage::disk($disk)->delete($attendance->photo_check_in);
                    }
                    $attendance->update(['photo_check_in' => null]);
                    $deletedCount++;
                }
            } elseif ($type === 'daily_out') {
                $attendance = Attendance::find($id);
                if ($attendance && $attendance->photo_check_out) {
                    if (Storage::disk($disk)->exists($attendance->photo_check_out)) {
                        Storage::disk($disk)->delete($attendance->photo_check_out);
                    }
                    $attendance->update(['photo_check_out' => null]);
                    $deletedCount++;
                }
            } elseif ($type === 'teaching') {
                $teaching = TeachingAttendance::find($id);
                if ($teaching && $teaching->photo) {
                    if (Storage::disk($disk)->exists($teaching->photo)) {
                        Storage::disk($disk)->delete($teaching->photo);
                    }
                    $teaching->update(['photo' => null]);
                    $deletedCount++;
                }
            }
        }

        return back()->with('message', "{$deletedCount} foto presensi berhasil dihapus.");
    }

    /**
     * Format bytes to human-readable string.
     */
    private function formatBytes(int $bytes): string
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
