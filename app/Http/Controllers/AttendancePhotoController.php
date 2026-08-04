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
        @set_time_limit(600);
        @ini_set('memory_limit', '1024M');

        $selectedPhotos = $request->input('photos', []);
        
        // Support GET request fallback via query parameters (ids & types)
        if (empty($selectedPhotos) && $request->has('ids')) {
            $ids = explode(',', $request->query('ids', ''));
            $types = explode(',', $request->query('types', ''));
            foreach ($ids as $idx => $idVal) {
                if (trim($idVal) !== '') {
                    $selectedPhotos[] = [
                        'id' => trim($idVal),
                        'type' => $types[$idx] ?? 'daily_in'
                    ];
                }
            }
        }

        if (empty($selectedPhotos)) {
            return response()->json(['message' => 'Tidak ada foto presensi yang dipilih.'], 400);
        }

        // 🚀 BATCH EAGER LOAD (Eliminates N+1 DB Queries & Cloudflare Timeout)
        $dailyIds = [];
        $teachingIds = [];
        foreach ($selectedPhotos as $item) {
            if (!empty($item['id'])) {
                if (($item['type'] ?? '') === 'teaching') {
                    $teachingIds[] = $item['id'];
                } else {
                    $dailyIds[] = $item['id'];
                }
            }
        }

        $dailyRecords = !empty($dailyIds) 
            ? Attendance::with('employee:id,name,photo_path')->whereIn('id', array_unique($dailyIds))->get()->keyBy('id')
            : collect();

        $teachingRecords = !empty($teachingIds)
            ? TeachingAttendance::with(['employee:id,name,photo_path', 'teachingSchedule:id,hour_number'])->whereIn('id', array_unique($teachingIds))->get()->keyBy('id')
            : collect();

        $storagePublicDir = storage_path('app/public');
        \Illuminate\Support\Facades\File::ensureDirectoryExists($storagePublicDir);

        $zipFileName = 'foto_presensi_' . time() . '_' . Str::random(5) . '.zip';
        $zipFilePath = $storagePublicDir . '/' . $zipFileName;

        $zip = new \ZipArchive();
        if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Gagal membuat berkas kompresi ZIP di server.'], 500);
        }

        $addedCount = 0;

        foreach ($selectedPhotos as $photoItem) {
            $type = $photoItem['type'] ?? 'daily_in';
            $id = $photoItem['id'] ?? null;
            $path = $photoItem['photo_path'] ?? null;
            $employeePhoto = null;

            $fileContent = null;
            $ext = 'jpg';
            $empName = 'pegawai';
            $dateStr = date('Y-m-d');
            $folder = 'lainnya';

            if ($id) {
                if ($type === 'daily_in' && isset($dailyRecords[$id])) {
                    $rec = $dailyRecords[$id];
                    $path = $rec->photo_check_in ?: $path;
                    $employeePhoto = $rec->employee->photo_path ?? null;
                    $empName = Str::slug($rec->employee->name ?? 'pegawai', '_');
                    $dateStr = $rec->date ?? date('Y-m-d');
                    $folder = 'presensi_harian/masuk';
                } elseif ($type === 'daily_out' && isset($dailyRecords[$id])) {
                    $rec = $dailyRecords[$id];
                    $path = $rec->photo_check_out ?: $path;
                    $employeePhoto = $rec->employee->photo_path ?? null;
                    $empName = Str::slug($rec->employee->name ?? 'pegawai', '_');
                    $dateStr = $rec->date ?? date('Y-m-d');
                    $folder = 'presensi_harian/pulang';
                } elseif ($type === 'teaching' && isset($teachingRecords[$id])) {
                    $rec = $teachingRecords[$id];
                    $path = $rec->photo ?: $path;
                    $employeePhoto = $rec->employee->photo_path ?? null;
                    $empName = Str::slug($rec->employee->name ?? 'guru', '_');
                    $dateStr = $rec->date ?? date('Y-m-d');
                    $hour = $rec->teachingSchedule->hour_number ?? 'x';
                    $folder = "presensi_mengajar/jam_ke_{$hour}";
                }
            }

            // Guaranteed Fallback metadata from request if DB batch didn't populate them
            if (empty($empName) || $empName === 'pegawai') {
                $empName = Str::slug($photoItem['employee_name'] ?? 'pegawai', '_');
            }
            if (empty($dateStr)) {
                $dateStr = $photoItem['date'] ?? date('Y-m-d');
            }
            if (empty($path)) {
                $path = $photoItem['photo_path'] ?? null;
            }

            if (!$path) {
                $path = "placeholder_{$empName}_{$dateStr}.svg";
            }

            try {
                // Case 1: Base64 Data URI String (camera swafoto/liveness)
                if (str_starts_with($path, 'data:image/')) {
                    $commaPos = strpos($path, ',');
                    if ($commaPos !== false) {
                        $base64Data = substr($path, $commaPos + 1);
                        $fileContent = base64_decode($base64Data);
                        if (preg_match('/^data:image\/(\w+);base64,/', substr($path, 0, 50), $matches)) {
                            $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                        }
                    }
                } 
                // Case 2: Direct File Path Check (Presensi Photo or Employee Profile Photo)
                else {
                    $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg';
                    $p1 = storage_path('app/public/' . $path);
                    $p2 = storage_path('app/' . $path);
                    $p3 = public_path('storage/' . $path);

                    if (file_exists($p1)) {
                        $fileContent = file_get_contents($p1);
                    } elseif (file_exists($p2)) {
                        $fileContent = file_get_contents($p2);
                    } elseif (file_exists($p3)) {
                        $fileContent = file_get_contents($p3);
                    } elseif (!empty($employeePhoto)) {
                        // Fallback to Employee Profile Photo if presensi photo file is not found on disk
                        $ep1 = storage_path('app/public/' . $employeePhoto);
                        $ep2 = public_path('storage/' . $employeePhoto);
                        if (file_exists($ep1)) {
                            $fileContent = file_get_contents($ep1);
                            $ext = pathinfo($employeePhoto, PATHINFO_EXTENSION) ?: 'jpg';
                        } elseif (file_exists($ep2)) {
                            $fileContent = file_get_contents($ep2);
                            $ext = pathinfo($employeePhoto, PATHINFO_EXTENSION) ?: 'jpg';
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Could not read photo for ZIP: " . substr($path, 0, 40) . ". Error: " . $e->getMessage());
            }

            // Case 3: Instant Fallback Card Generation (Deadlock-Free & Instant)
            if (!$fileContent) {
                $typeLabel = $type === 'daily_in' ? 'Presensi Masuk' : ($type === 'daily_out' ? 'Presensi Pulang' : 'Presensi Mengajar');
                $displayEmp = str_replace('_', ' ', ucwords($empName, '_'));
                $fileContent = $this->generateFallbackPhotoSvg($displayEmp, $dateStr, $typeLabel);
                $ext = 'svg';
            }

            if ($fileContent) {
                $uniqueIdSuffix = $id ? "_id{$id}" : '_' . Str::random(4);
                $filename = "{$dateStr}_{$empName}{$uniqueIdSuffix}.{$ext}";
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

    /**
     * Generate a fallback SVG image card when physical image file is not found on disk.
     */
    private function generateFallbackPhotoSvg(string $employeeName, string $date, string $typeLabel): string
    {
        $safeName = htmlspecialchars($employeeName, ENT_QUOTES, 'UTF-8');
        $safeDate = htmlspecialchars($date, ENT_QUOTES, 'UTF-8');
        $safeLabel = htmlspecialchars($typeLabel, ENT_QUOTES, 'UTF-8');

        return <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0B0F19"/>
  <rect x="20" y="20" width="560" height="360" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>
  <circle cx="300" cy="130" r="45" fill="#4F46E5" opacity="0.2"/>
  <circle cx="300" cy="130" r="30" fill="#4F46E5"/>
  <path d="M290 130 L297 137 L312 120" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="300" y="210" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">{$safeName}</text>
  <text x="300" y="240" font-family="Arial, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">{$safeLabel} • {$safeDate}</text>
  <text x="300" y="270" font-family="Arial, sans-serif" font-size="13" fill="#64748B" text-anchor="middle">SIP MU Enterprise - Dokumen Presensi</text>
  <rect x="180" y="300" width="240" height="36" rx="8" fill="#312E81"/>
  <text x="300" y="323" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#818CF8" text-anchor="middle">SMK MANBAUL ULUM CIREBON</text>
</svg>
SVG;
    }
}
