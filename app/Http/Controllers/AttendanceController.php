<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CampusLocation;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $employee = $user->employee;
        $roles = $user->getRoleNames();
        $primaryRole = $roles->first() ?? 'Karyawan';

        // Basic personal data
        $todayAttendance = $employee ? Attendance::where('employee_id', $employee->id)
            ->whereDate('date', Carbon::today())
            ->first() : null;

        $campusLocations = CampusLocation::all();

        // Personal Stats (Optimized Query)
        $monthlyStatsRaw = $employee ? Attendance::where('employee_id', $employee->id)
            ->whereMonth('date', Carbon::now()->month)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')->toArray() : [];

        // Admin/Management stats — for roles with management access
        $adminStats = null;
        if ($user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Bendahara'])) {
            $adminStats = [
                'total_employees' => Employee::count(),
                'present_today' => Attendance::whereDate('date', Carbon::today())->where('status', 'present')->count(),
                'late_today' => Attendance::whereDate('date', Carbon::today())->where('status', 'late')->count(),
                'pending_leaves' => \App\Models\LeaveRequest::where('status', 'pending')->count(),
                'recent_pending_leaves' => \App\Models\LeaveRequest::with('employee')->where('status', 'pending')->orderBy('created_at', 'desc')->take(4)->get()->map(fn($l) => [
                    'id' => $l->id,
                    'employee_name' => $l->employee->name,
                    'type' => $l->type,
                    'reason' => $l->reason,
                    'start_date' => \Carbon\Carbon::parse($l->start_date)->format('d M Y'),
                    'end_date' => \Carbon\Carbon::parse($l->end_date)->format('d M Y'),
                ]),
            ];
        }

        // Executive Stats - For top level management
        $executiveStats = null;
        if ($user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum'])) {
            $totalEmployees = Employee::count();
            
            // Today's overview
            $todayRaw = Attendance::whereDate('date', Carbon::today())
                ->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            
            $recordedToday = array_sum($todayRaw);
            $unrecorded = max(0, $totalEmployees - $recordedToday);
            
            $dailyOverview = [
                ['name' => 'Tepat Waktu', 'value' => $todayRaw['present'] ?? 0, 'color' => '#10b981'],
                ['name' => 'Terlambat', 'value' => $todayRaw['late'] ?? 0, 'color' => '#f59e0b'],
                ['name' => 'Sakit/Izin', 'value' => ($todayRaw['sick'] ?? 0) + ($todayRaw['permit'] ?? 0), 'color' => '#3b82f6'],
                ['name' => 'Alpha', 'value' => $todayRaw['alpha'] ?? 0, 'color' => '#ef4444'],
                ['name' => 'Belum Absen', 'value' => $unrecorded, 'color' => '#94a3b8'],
            ];

            // Top Performers (Most 'present' this month)
            $topPerformers = \Illuminate\Support\Facades\DB::table('attendances')
                ->join('employees', 'attendances.employee_id', '=', 'employees.id')
                ->whereMonth('attendances.date', Carbon::now()->month)
                ->whereYear('attendances.date', Carbon::now()->year)
                ->where('attendances.status', 'present')
                ->select('employees.name', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employees.id', 'employees.name')
                ->orderByDesc('count')
                ->limit(3)
                ->get();

            // Bottom Performers (Most 'alpha' + 'late' this month)
            $bottomPerformers = \Illuminate\Support\Facades\DB::table('attendances')
                ->join('employees', 'attendances.employee_id', '=', 'employees.id')
                ->whereMonth('attendances.date', Carbon::now()->month)
                ->whereYear('attendances.date', Carbon::now()->year)
                ->whereIn('attendances.status', ['alpha', 'late'])
                ->select('employees.name', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employees.id', 'employees.name')
                ->orderByDesc('count')
                ->limit(3)
                ->get();

            $executiveStats = [
                'dailyOverview' => $dailyOverview,
                'topPerformers' => $topPerformers,
                'bottomPerformers' => $bottomPerformers,
            ];
        }

        $todayHoliday = \App\Models\Holiday::where('date', Carbon::today()->toDateString())->first();

        // Role-specific data
        $roleData = [];

        // Jadwal mengajar hari ini (untuk semua pegawai yang punya jadwal, bukan hanya role Guru)
        if ($employee) {
            $todayDow = Carbon::now()->dayOfWeekIso;
            if ($todayDow >= 1 && $todayDow <= 5) {
                $todaySchedule = \App\Models\TeachingSchedule::with('schoolClass')
                    ->where('employee_id', $employee->id)
                    ->where('day_of_week', $todayDow)
                    ->orderBy('hour_number')
                    ->get();
                if ($todaySchedule->isNotEmpty()) {
                    $roleData['todayTeachingSchedule'] = $todaySchedule->map(fn($s) => [
                        'hour_number' => $s->hour_number,
                        'subject' => $s->subject,
                        'class_name' => $s->schoolClass->name ?? '-',
                    ]);
                    $roleData['totalWeeklyHours'] = \App\Models\TeachingSchedule::where('employee_id', $employee->id)->count();
                }
            }
        }

        // Bendahara: payroll stats
        if ($user->hasRole('Bendahara')) {
            $roleData['payrollStats'] = [
                'total_this_month' => \App\Models\Payroll::where('month', Carbon::now()->month)->where('year', Carbon::now()->year)->count(),
                'paid' => \App\Models\Payroll::where('month', Carbon::now()->month)->where('year', Carbon::now()->year)->where('status', 'paid')->count(),
                'pending' => \App\Models\Payroll::where('month', Carbon::now()->month)->where('year', Carbon::now()->year)->where('status', '!=', 'paid')->count(),
            ];
        }

        $isGuruMurni = false;
        if ($employee) {
            $employee->load('positions');
            $isGuruMurni = $employee->positions->count() === 1 && $employee->positions->first()?->name === 'Guru';
        }

        return Inertia::render('Dashboard', [
            'isGuruMurni' => $isGuruMurni,
            'isEmployee' => (bool)$employee,
            'employee' => $employee ? $employee->load('positions') : null,
            'todayAttendance' => $todayAttendance,
            'todayHoliday' => $todayHoliday,
            'campusLocations' => $campusLocations,
            'adminStats' => $adminStats,
            'executiveStats' => $executiveStats,
            'primaryRole' => $primaryRole,
            'roleData' => $roleData,
            'monthlyStats' => [
                'present' => $monthlyStatsRaw['present'] ?? 0,
                'late' => $monthlyStatsRaw['late'] ?? 0,
                'alpha' => $monthlyStatsRaw['alpha'] ?? 0,
                'sick' => $monthlyStatsRaw['sick'] ?? 0,
                'permit' => $monthlyStatsRaw['permit'] ?? 0,
            ],
        ]);
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'campus_location_id' => 'required|exists:campus_locations,id',
            'photo' => 'nullable|string',
        ]);

        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->withErrors(['message' => 'Data pegawai tidak ditemukan.']);
        }

        $today = Carbon::today();
        $now = Carbon::now();

        $existing = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return back()->withErrors(['message' => 'Anda sudah melakukan presensi masuk hari ini.']);
        }

        // ── Holiday Check ──
        $todayHoliday = \App\Models\Holiday::where('date', $today->toDateString())->first();
        if ($todayHoliday) {
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->name}). Presensi tidak dapat dilakukan."]);
        }

        // ── Geofencing ──
        $campus = CampusLocation::findOrFail($request->campus_location_id);
        $distance = $this->haversineDistance(
            $request->latitude, $request->longitude,
            (float)$campus->latitude, (float)$campus->longitude
        );

        if ($distance > $campus->radius) {
            return back()->withErrors(['message' => "Lokasi Anda berada di luar radius {$campus->name} (" . round($distance) . "m dari pusat, batas {$campus->radius}m). Presensi ditolak."]);
        }

        // ── Time blocking ──
        $settings = \App\Models\SystemSetting::pluck('value', 'key');
        $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);
        $jamMasukSetting = $settings['jam_masuk'] ?? '07:00';
        $jamMasuk = Carbon::createFromFormat('H:i', $jamMasukSetting);
        $jamBatas = $jamMasuk->copy()->addMinutes($batasTerlambatMenit);
        $batasAwal = $jamMasuk->copy()->subMinutes(10); // Batas awal 10 menit sebelum jam masuk

        if ($now->lt($batasAwal)) {
            return back()->withErrors(['message' => "Belum waktunya presensi masuk. Presensi baru dibuka pada pukul " . $batasAwal->format('H:i')]);
        }

        $status = 'present';

        if ($now->gt($jamBatas)) {
            // Check for unlock token
            $unlock = \App\Models\AttendanceUnlock::where('employee_id', $employee->id)
                ->whereDate('date', $today)
                ->where('type', 'daily_checkin')
                ->where('used', false)
                ->where(function ($query) use ($now) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
                })
                ->first();

            if (!$unlock) {
                return back()->withErrors(['message' => "Batas presensi masuk ({$jamMasukSetting} + {$batasTerlambatMenit} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum untuk membuka akses."]);
            }

            // Mark unlock as used
            $unlock->update(['used' => true]);
            $status = 'late';
        } elseif ($now->gt($jamMasuk)) {
            $status = 'late';
        }

        $photoPath = null;
        if ($request->photo) {
            $slugName = \Illuminate\Support\Str::slug($employee->name, '_');
            $dayName = Carbon::now()->translatedFormat('l');
            $dateStr = Carbon::now()->format('d-m-Y');
            $timeStr = Carbon::now()->format('H-i-s');
            $fileName = "{$slugName}_masuk_{$dayName}_{$dateStr}_{$timeStr}";

            $compressor = app(\App\Services\ImageCompressionService::class);
            $photoPath = $compressor->compressFromBase64(
                $request->photo,
                'attendances/daily',
                $fileName,
                'attendance'
            );

            if ($photoPath === null) {
                return back()->withErrors(['message' => 'Format foto presensi tidak valid atau gagal diproses.']);
            }
        }

        Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'check_in' => $now->toTimeString(),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'campus_location_id' => $request->campus_location_id,
            'photo_check_in' => $photoPath,
            'status' => $status,
        ]);

        $msg = $status === 'late' ? 'Presensi masuk berhasil (Terlambat).' : 'Presensi masuk berhasil!';
        return back()->with(['message' => $msg]);
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'campus_location_id' => 'required|exists:campus_locations,id',
            'photo' => 'nullable|string',
        ]);

        $user = Auth::user();
        $employee = $user->employee;

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', Carbon::today())
            ->first();

        if (!$attendance || $attendance->check_out) {
            return back()->withErrors(['message' => 'Presensi masuk tidak ditemukan atau sudah presensi keluar.']);
        }

        // ── Holiday Check ──
        $todayHoliday = \App\Models\Holiday::where('date', Carbon::today()->toDateString())->first();
        if ($todayHoliday) {
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->name}). Presensi tidak dapat dilakukan."]);
        }

        // ── Geofencing ──
        $campus = CampusLocation::findOrFail($request->campus_location_id);
        $distance = $this->haversineDistance(
            $request->latitude, $request->longitude,
            (float)$campus->latitude, (float)$campus->longitude
        );

        if ($distance > $campus->radius) {
            return back()->withErrors(['message' => "Lokasi Anda berada di luar radius {$campus->name} (" . round($distance) . "m dari pusat, batas {$campus->radius}m). Presensi ditolak."]);
        }

        // Validasi jam pulang
        $settings = \App\Models\SystemSetting::pluck('value', 'key');
        $jamKeluarSetting = $settings['jam_keluar'] ?? '14:40';
        $jamKeluar = Carbon::createFromFormat('H:i', $jamKeluarSetting);
        $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);
        $jamBatas = $jamKeluar->copy()->addMinutes($batasTerlambatMenit);
        $now = Carbon::now();

        if ($now->lt($jamKeluar)) {
            return back()->withErrors(['message' => 'Belum waktunya jam pulang. Jam keluar adalah ' . $jamKeluarSetting]);
        }

        if ($now->gt($jamBatas)) {
            // Check for unlock token
            $unlock = \App\Models\AttendanceUnlock::where('employee_id', $employee->id)
                ->whereDate('date', Carbon::today())
                ->where('type', 'daily_checkout')
                ->where('used', false)
                ->where(function ($query) use ($now) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
                })
                ->first();

            if (!$unlock) {
                return back()->withErrors(['message' => "Batas presensi keluar ({$jamKeluarSetting} + {$batasTerlambatMenit} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum untuk membuka akses."]);
            }

            // Mark unlock as used
            $unlock->update(['used' => true]);
        }

        $photoPath = $attendance->photo_check_out;
        if ($request->photo) {
            $slugName = \Illuminate\Support\Str::slug($employee->name, '_');
            $dayName = Carbon::now()->translatedFormat('l');
            $dateStr = Carbon::now()->format('d-m-Y');
            $timeStr = Carbon::now()->format('H-i-s');
            $fileName = "{$slugName}_pulang_{$dayName}_{$dateStr}_{$timeStr}";

            $compressor = app(\App\Services\ImageCompressionService::class);
            $newPhotoPath = $compressor->compressFromBase64(
                $request->photo,
                'attendances/daily',
                $fileName,
                'attendance'
            );

            if ($newPhotoPath !== null) {
                $photoPath = $newPhotoPath;
            } else {
                return back()->withErrors(['message' => 'Format foto presensi keluar tidak valid atau gagal diproses.']);
            }
        }

        $attendance->update([
            'check_out' => Carbon::now()->toTimeString(),
            'photo_check_out' => $photoPath,
        ]);

        return back()->with(['message' => 'Presensi keluar berhasil!']);
    }

    public function monitoring()
    {
        $today = Carbon::today();
        $todayHoliday = \App\Models\Holiday::where('date', $today->toDateString())->first();
        
        $attendances = Attendance::with('employee.positions')
            ->whereDate('date', $today)
            ->get()
            ->keyBy('employee_id');

        $campusLocations = CampusLocation::all();
        $employees = Employee::with('positions')->where('status', 'active')->get();
        $leaveRequests = \App\Models\LeaveRequest::whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', 'approved')
            ->get()
            ->keyBy('employee_id');

        $monitoringData = collect();

        foreach ($employees as $employee) {
            if ($attendances->has($employee->id)) {
                $att = $attendances->get($employee->id);
                $att->campus_name = $this->resolveCampusName($att->latitude, $att->longitude, $campusLocations);
                $monitoringData->push($att);
            } else {
                // Determine if leave or alpha
                $status = $todayHoliday ? 'holiday' : 'alpha';
                if ($leaveRequests->has($employee->id)) {
                    $leave = $leaveRequests->get($employee->id);
                    if ($leave->type === 'Sakit' || $leave->type === 'sakit') $status = 'sick';
                    elseif (in_array($leave->type, ['Izin Pribadi', 'Izin Dinas Luar', 'Cuti', 'izin_pribadi', 'izin_dinas_luar', 'cuti', 'izin_pulang_cepat'])) $status = 'permit';
                }

                // Create a virtual attendance record for display
                $monitoringData->push((object)[
                    'id' => 'virtual_' . $employee->id,
                    'employee_id' => $employee->id,
                    'employee' => $employee,
                    'date' => $today->format('Y-m-d'),
                    'check_in' => null,
                    'check_out' => null,
                    'status' => $status,
                    'campus_name' => '-',
                    'photo_check_in' => null,
                    'photo_check_out' => null,
                ]);
            }
        }

        $stats = [
            'present' => $monitoringData->where('status', 'present')->count(),
            'late'    => $monitoringData->where('status', 'late')->count(),
            'alpha'   => $monitoringData->where('status', 'alpha')->count(),
            'permit'  => $monitoringData->where('status', 'permit')->count(),
            'sick'    => $monitoringData->where('status', 'sick')->count(),
            'holiday' => $monitoringData->where('status', 'holiday')->count(),
            'total'   => $employees->count(),
        ];

        $todayUnlocks = \App\Models\AttendanceUnlock::with(['employee', 'unlockedByUser', 'teachingSchedule.schoolClass'])
            ->whereDate('date', $today)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($unlock) {
                return [
                    'id' => $unlock->id,
                    'employee_name' => $unlock->employee->name ?? 'Unknown',
                    'type' => $unlock->type,
                    'teaching_schedule' => $unlock->teachingSchedule ? [
                        'hour_number' => $unlock->teachingSchedule->hour_number,
                        'subject' => $unlock->teachingSchedule->subject,
                        'class_name' => $unlock->teachingSchedule->schoolClass->name ?? '-',
                    ] : null,
                    'reason' => $unlock->reason,
                    'used' => $unlock->used,
                    'unlocked_by_name' => $unlock->unlockedByUser->name ?? 'System',
                    'created_at' => $unlock->created_at->format('H:i'),
                    'expires_at' => $unlock->expires_at ? $unlock->expires_at->format('H:i') : null,
                    'is_expired' => $unlock->expires_at ? Carbon::now()->gt($unlock->expires_at) : false,
                ];
            });

        return Inertia::render('Monitoring/Attendance', [
            'attendances' => $monitoringData->values(),
            'stats'       => $stats,
            'employees'   => $employees->map(fn($e) => ['id' => $e->id, 'name' => $e->name]),
            'todayHoliday' => $todayHoliday,
            'todaySchedules' => $this->getTodayTeachingSchedules(),
            'todayUnlocks' => $todayUnlocks,
        ]);
    }

    /**
     * Resolve the nearest campus name from GPS coordinates using Haversine formula.
     */
    private function resolveCampusName($lat, $lng, $campusLocations)
    {
        if (!$lat || !$lng) return null;

        $closest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($campusLocations as $campus) {
            $distance = $this->haversineDistance($lat, $lng, $campus->latitude, $campus->longitude);
            if ($distance < $minDistance) {
                $minDistance = $distance;
                $closest = $campus;
            }
        }

        // Only assign if within radius (in meters)
        if ($closest && $minDistance <= $closest->radius) {
            return $closest->name;
        }

        return 'Di Luar Jangkauan';
    }

    /**
     * Calculate distance between two GPS points in meters (Haversine).
     */
    private function haversineDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    public function exportMonitoringExcel()
    {
        $date = Carbon::today()->toDateString();
        $fileName = 'Monitoring_Presensi_' . Carbon::today()->format('d_M_Y') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\MonitoringExport($date),
            $fileName
        );
    }

    public function exportMonitoringPdf()
    {
        $date = Carbon::today();
        $attendances = Attendance::with('employee.positions')
            ->whereDate('date', $date)
            ->get()
            ->sortBy('employee.name');

        $campusLocations = CampusLocation::all();

        // Resolve campus names
        $attendances->transform(function ($att) use ($campusLocations) {
            $att->campus_name = $this->resolveCampusName($att->latitude, $att->longitude, $campusLocations);
            return $att;
        });

        $stats = [
            'present' => $attendances->where('status', 'present')->count(),
            'late'    => $attendances->where('status', 'late')->count(),
            'alpha'   => $attendances->where('status', 'alpha')->count(),
            'permit'  => $attendances->where('status', 'permit')->count(),
            'sick'    => $attendances->where('status', 'sick')->count(),
        ];

        $dateFormatted = $date->translatedFormat('l, d F Y');
        $printDate = Carbon::now()->translatedFormat('d F Y, H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.monitoring', compact('attendances', 'stats', 'dateFormatted', 'printDate'));
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('Monitoring_Presensi_' . $date->format('d_M_Y') . '.pdf');
    }
    public function update(Request $request, Attendance $attendance)
    {
        $request->validate([
            'status' => 'required|in:present,late,alpha,permit,sick',
            'teaching_hours' => 'required|numeric|min:0',
            'inval_hours' => 'required|numeric|min:0',
        ]);

        $attendance->update([
            'status' => $request->status,
            'teaching_hours' => $request->teaching_hours,
            'inval_hours' => $request->inval_hours,
        ]);

        return back()->with(['message' => 'Data presensi berhasil diperbarui.']);
    }

    public function recap(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $roleFilter = $request->input('role', 'all'); // 'all', 'Guru', 'Staff'

        $query = Employee::with(['positions', 'user.roles'])->where('status', 'active');
        $employees = $query->get();

        if ($roleFilter === 'Guru') {
            $employees = $employees->filter(function($emp) {
                return $emp->teachingSchedules()->exists();
            });
        } elseif ($roleFilter === 'Staff') {
            $employees = $employees->filter(function($emp) {
                return !$emp->teachingSchedules()->exists();
            });
        }

        // Calculate recap
        $recap = [];
        $totalStats = [
            'present' => 0,
            'late' => 0,
            'permit' => 0,
            'sick' => 0,
            'alpha' => 0
        ];

        // Get working days (weekdays minus holidays)
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
        $workingDaysDates = [];
        $holidays = \App\Models\Holiday::whereMonth('date', $month)->whereYear('date', $year)->pluck('date')->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))->toArray();

        $validHolidayCount = 0;
        foreach ($holidays as $hDate) {
            if (Carbon::parse($hDate)->isWeekday()) {
                $validHolidayCount++;
            }
        }

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::create($year, $month, $i);
            // Assuming Monday-Friday workweek. If Saturday is included, adjust here.
            // Some schools work Saturday. Let's assume Mon-Sat or Mon-Fri? We'll assume Mon-Fri for typical.
            // But wait, the system has teaching schedules on Saturday?
            // "if ($todayDow >= 1 && $todayDow <= 5)" in PresensiController means Mon-Fri! So working days are Mon-Fri.
            if ($date->isWeekday()) {
                if (!in_array($date->format('Y-m-d'), $holidays)) {
                    $workingDaysDates[] = $date->format('Y-m-d');
                }
            }
        }

        foreach ($employees as $emp) {
            $attendances = Attendance::where('employee_id', $emp->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get()
                ->keyBy(fn($a) => Carbon::parse($a->date)->format('Y-m-d'));
            
            $leaves = \App\Models\LeaveRequest::where('employee_id', $emp->id)
                ->where('status', 'approved')
                ->where(function ($q) use ($month, $year) {
                    $q->whereMonth('start_date', $month)->whereYear('start_date', $year)
                      ->orWhereMonth('end_date', $month)->whereYear('end_date', $year);
                })->get();

            $presentCount = 0;
            $lateCount = 0;
            $permitCount = 0;
            $sickCount = 0;
            $alphaCount = 0;
            $teaching_hours = $attendances->sum('teaching_hours');

            // Count valid holidays as present for payroll calculation
            $holidayCount = $validHolidayCount;

            // Only evaluate attendance against working days
            foreach ($workingDaysDates as $wDate) {
                if ($attendances->has($wDate)) {
                    $att = $attendances->get($wDate);
                    if ($att->status === 'present') $presentCount++;
                    elseif ($att->status === 'late') $lateCount++;
                    elseif ($att->status === 'alpha') $alphaCount++;
                    elseif ($att->status === 'permit') $permitCount++;
                    elseif ($att->status === 'sick') $sickCount++;
                } else {
                    // Check if on leave
                    $onLeave = false;
                    foreach ($leaves as $leave) {
                        $start = Carbon::parse($leave->start_date);
                        $end = Carbon::parse($leave->end_date);
                        $current = Carbon::parse($wDate);
                        if ($current->betweenIncluded($start, $end)) {
                            $onLeave = true;
                            if ($leave->type === 'Sakit' || $leave->type === 'sakit') $sickCount++;
                            else $permitCount++;
                            break;
                        }
                    }
                    if (!$onLeave) {
                        $alphaCount++;
                    }
                }
            }

            $recap[] = [
                'id' => $emp->id,
                'name' => $emp->name,
                'nik' => $emp->nik ?? $emp->nip,
                'photo_path' => $emp->photo_path,
                'position' => $emp->positions->where('pivot.is_primary', true)->first()?->name ?? ($emp->positions->first()?->name ?? '-'),
                'position_names' => $emp->positions->pluck('name')->toArray(),
                'is_guru' => $emp->teachingSchedules()->exists(),
                'present' => $presentCount + $holidayCount,
                'late' => $lateCount,
                'permit' => $permitCount,
                'sick' => $sickCount,
                'alpha' => $alphaCount,
                'teaching_hours' => $teaching_hours,
                'holiday_count' => $holidayCount,
            ];

            $totalStats['present'] += $presentCount + $holidayCount;
            $totalStats['late'] += $lateCount;
            $totalStats['permit'] += $permitCount;
            $totalStats['sick'] += $sickCount;
            $totalStats['alpha'] += $alphaCount;
        }

        return Inertia::render('Monitoring/Recap', [
            'recapData' => collect($recap)->sortBy('name')->values()->all(),
            'totalStats' => $totalStats,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'role' => $roleFilter,
            ]
        ]);
    }

    public function exportExcel(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $roleFilter = $request->input('role', 'all');

        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $fileName = "Rekap_Presensi_{$months[$month]}_{$year}.xlsx";

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendanceRecapExport($month, $year, $roleFilter),
            $fileName
        );
    }

    public function exportPdf(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $roleFilter = $request->input('role', 'all');

        $employees = Employee::with(['positions', 'user.roles'])->where('status', 'active')->get();

        if ($roleFilter === 'Guru') {
            $employees = $employees->filter(fn($emp) => $emp->teachingSchedules()->exists());
        } elseif ($roleFilter === 'Staff') {
            $employees = $employees->filter(fn($emp) => !$emp->teachingSchedules()->exists());
        }

        // Get working days
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
        $workingDaysDates = [];
        $holidays = \App\Models\Holiday::whereMonth('date', $month)->whereYear('date', $year)->pluck('date')->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))->toArray();

        $validHolidayCount = 0;
        foreach ($holidays as $hDate) {
            if (Carbon::parse($hDate)->isWeekday()) {
                $validHolidayCount++;
            }
        }

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::create($year, $month, $i);
            if ($date->isWeekday()) {
                if (!in_array($date->format('Y-m-d'), $holidays)) {
                    $workingDaysDates[] = $date->format('Y-m-d');
                }
            }
        }

        $recapData = [];
        $stats = ['present' => 0, 'late' => 0, 'permit' => 0, 'sick' => 0, 'alpha' => 0];

        foreach ($employees->sortBy('name') as $emp) {
            $attendances = Attendance::where('employee_id', $emp->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get()
                ->keyBy(fn($a) => Carbon::parse($a->date)->format('Y-m-d'));

            $leaves = \App\Models\LeaveRequest::where('employee_id', $emp->id)
                ->where('status', 'approved')
                ->where(function ($q) use ($month, $year) {
                    $q->whereMonth('start_date', $month)->whereYear('start_date', $year)
                      ->orWhereMonth('end_date', $month)->whereYear('end_date', $year);
                })->get();

            $presentCount = 0;
            $lateCount = 0;
            $permitCount = 0;
            $sickCount = 0;
            $alphaCount = 0;
            $holidayCount = $validHolidayCount;

            foreach ($workingDaysDates as $wDate) {
                if ($attendances->has($wDate)) {
                    $att = $attendances->get($wDate);
                    if ($att->status === 'present') $presentCount++;
                    elseif ($att->status === 'late') $lateCount++;
                    elseif ($att->status === 'alpha') $alphaCount++;
                    elseif ($att->status === 'permit') $permitCount++;
                    elseif ($att->status === 'sick') $sickCount++;
                } else {
                    $onLeave = false;
                    foreach ($leaves as $leave) {
                        $start = Carbon::parse($leave->start_date);
                        $end = Carbon::parse($leave->end_date);
                        $current = Carbon::parse($wDate);
                        if ($current->betweenIncluded($start, $end)) {
                            $onLeave = true;
                            if ($leave->type === 'Sakit' || $leave->type === 'sakit') $sickCount++;
                            else $permitCount++;
                            break;
                        }
                    }
                    if (!$onLeave) {
                        $alphaCount++;
                    }
                }
            }

            $recapData[] = [
                'nik' => $emp->nik ?? $emp->nip,
                'name' => $emp->name,
                'position' => $emp->positions->where('pivot.is_primary', true)->first()?->name ?? ($emp->positions->first()?->name ?? '-'),
                'present' => $presentCount + $holidayCount,
                'late' => $lateCount,
                'permit' => $permitCount,
                'sick' => $sickCount,
                'alpha' => $alphaCount,
                'teaching_hours' => $attendances->sum('teaching_hours'),
            ];

            $stats['present'] += $presentCount + $holidayCount;
            $stats['late'] += $lateCount;
            $stats['permit'] += $permitCount;
            $stats['sick'] += $sickCount;
            $stats['alpha'] += $alphaCount;
        }

        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $monthName = $months[$month];
        $printDate = Carbon::now()->translatedFormat('d F Y, H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.attendance-recap', compact('recapData', 'stats', 'monthName', 'year', 'printDate'));
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download("Rekap_Presensi_{$monthName}_{$year}.pdf");
    }

    /**
     * Unlock attendance for a blocked employee (Admin Presensi/Kurikulum).
     */
    public function unlockAttendance(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:daily_checkin,daily_checkout,teaching',
            'teaching_schedule_id' => 'nullable|exists:teaching_schedules,id',
            'reason' => 'nullable|string|max:500',
            'expires_in_minutes' => 'required|integer|in:15,30,60',
        ]);

        $today = Carbon::today();

        // Check if unlock already exists
        $query = \App\Models\AttendanceUnlock::where('employee_id', $request->employee_id)
            ->whereDate('date', $today)
            ->where('type', $request->type)
            ->where('used', false);

        if ($request->type === 'teaching' && $request->teaching_schedule_id) {
            $query->where('teaching_schedule_id', $request->teaching_schedule_id);
        }

        if ($query->exists()) {
            return back()->withErrors(['message' => 'Unlock sudah diberikan sebelumnya untuk pegawai ini hari ini.']);
        }

        \App\Models\AttendanceUnlock::create([
            'employee_id' => $request->employee_id,
            'date' => $today,
            'type' => $request->type,
            'teaching_schedule_id' => $request->teaching_schedule_id,
            'unlocked_by' => Auth::id(),
            'reason' => $request->reason,
            'expires_at' => Carbon::now()->addMinutes((int) $request->expires_in_minutes),
        ]);

        $employee = Employee::find($request->employee_id);
        return back()->with('message', "Akses presensi untuk {$employee->name} berhasil dibuka.");
    }
    /**
     * Get today's teaching schedules grouped by employee.
     */
    private function getTodayTeachingSchedules()
    {
        $todayDow = Carbon::now()->dayOfWeekIso;
        if ($todayDow < 1 || $todayDow > 5) return [];

        return \App\Models\TeachingSchedule::with('schoolClass')
            ->where('day_of_week', $todayDow)
            ->orderBy('hour_number')
            ->get()
            ->groupBy('employee_id')
            ->map(fn($schedules) => $schedules->map(fn($s) => [
                'id' => $s->id,
                'hour_number' => $s->hour_number,
                'subject' => $s->subject,
                'class_name' => $s->schoolClass?->name ?? '-',
                'time_start' => \App\Models\TeachingSchedule::hourSlots()[$s->hour_number]['start'] ?? null,
                'time_end' => \App\Models\TeachingSchedule::hourSlots()[$s->hour_number]['end'] ?? null,
            ])->values())
            ->toArray();
    }
}
