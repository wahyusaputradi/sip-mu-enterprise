<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CampusLocation;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Services\AttendanceRecapService;

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

        // Personal Stats via AttendanceRecapService
        $monthlyStatsRaw = $employee ? Attendance::where('employee_id', $employee->id)
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')->toArray() : [];

        $personalRecap = null;
        if ($employee) {
            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;
            $monthlyRecap = AttendanceRecapService::getMonthlyRecap($currentMonth, $currentYear, 'all');
            $allRecaps = $monthlyRecap['recapData'] ?? [];
            foreach ($allRecaps as $rc) {
                if (isset($rc['id']) && $rc['id'] == $employee->id) {
                    $personalRecap = $rc;
                    break;
                }
            }
        }

        // Admin/Management stats — for roles with management access
        $adminStats = null;
        $managementMonthlyStats = null;
        $dailyTrendStats = [];

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

            // School-wide monthly stats
            $mgmtStatsRaw = Attendance::whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year)
                ->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')->toArray();

            $managementMonthlyStats = [
                'present' => $mgmtStatsRaw['present'] ?? 0,
                'late' => $mgmtStatsRaw['late'] ?? 0,
                'sick' => $mgmtStatsRaw['sick'] ?? 0,
                'permit' => $mgmtStatsRaw['permit'] ?? 0,
                'alpha' => $mgmtStatsRaw['alpha'] ?? 0,
            ];

            // Daily attendance trend for the current month up to today
            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;
            $daysInMonth = Carbon::now()->daysInMonth;

            $dailyRaw = Attendance::whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->selectRaw('date, status, count(*) as count')
                ->groupBy('date', 'status')
                ->get()
                ->groupBy(function($item) {
                    return Carbon::parse($item->date)->format('Y-m-d');
                });

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dt = Carbon::createFromDate($currentYear, $currentMonth, $d);
                if ($dt->isFuture()) {
                    break;
                }

                $dateStr = $dt->toDateString();
                $dayRecords = $dailyRaw->get($dateStr, collect());

                $pCount = 0;
                $lCount = 0;
                $spCount = 0;
                $aCount = 0;

                foreach ($dayRecords as $rec) {
                    if ($rec->status === 'present') $pCount += $rec->count;
                    elseif ($rec->status === 'late') $lCount += $rec->count;
                    elseif (in_array($rec->status, ['sick', 'permit'])) $spCount += $rec->count;
                    elseif ($rec->status === 'alpha') $aCount += $rec->count;
                }

                $dailyTrendStats[] = [
                    'day' => $dt->format('d M'),
                    'date' => $dateStr,
                    'present' => $pCount,
                    'late' => $lCount,
                    'sick_permit' => $spCount,
                    'alpha' => $aCount,
                    'total' => $pCount + $lCount + $spCount + $aCount,
                ];
            }
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

            // Executive Stats - Multi-Source Evaluation (Jam Masuk + Jam Keluar + Jam Mengajar)
            $dailyPresent = \Illuminate\Support\Facades\DB::table('attendances')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->where('status', 'present')
                ->select('employee_id', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employee_id')
                ->pluck('count', 'employee_id');

            $dailyCheckout = \Illuminate\Support\Facades\DB::table('attendances')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereNotNull('check_out')
                ->select('employee_id', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employee_id')
                ->pluck('count', 'employee_id');

            $teachingPresent = \Illuminate\Support\Facades\DB::table('teaching_attendances')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->where('status', 'present')
                ->select('employee_id', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employee_id')
                ->pluck('count', 'employee_id');

            $allEmployees = Employee::select('id', 'name')->get();

            // 🟢 Top Performers: Hadir tepat waktu (Masuk + Pulang + Mengajar)
            $topPerformersList = [];
            foreach ($allEmployees as $emp) {
                $totalOnTime = ($dailyPresent->get($emp->id, 0)) + ($dailyCheckout->get($emp->id, 0)) + ($teachingPresent->get($emp->id, 0));
                if ($totalOnTime > 0) {
                    $topPerformersList[] = [
                        'name' => $emp->name,
                        'count' => $totalOnTime,
                    ];
                }
            }
            usort($topPerformersList, fn($a, $b) => $b['count'] <=> $a['count']);
            $topPerformers = array_slice($topPerformersList, 0, 5);

            // 🔴 Needs Attention: Terlambat / Alpha (Masuk + Pulang + Mengajar)
            $dailyViolations = \Illuminate\Support\Facades\DB::table('attendances')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereIn('status', ['late', 'alpha'])
                ->select('employee_id', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employee_id')
                ->pluck('count', 'employee_id');

            $teachingViolations = \Illuminate\Support\Facades\DB::table('teaching_attendances')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereIn('status', ['late', 'alpha'])
                ->select('employee_id', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employee_id')
                ->pluck('count', 'employee_id');

            $bottomPerformersList = [];
            foreach ($allEmployees as $emp) {
                $totalViolations = ($dailyViolations->get($emp->id, 0)) + ($teachingViolations->get($emp->id, 0));
                if ($totalViolations > 0) {
                    $bottomPerformersList[] = [
                        'name' => $emp->name,
                        'count' => $totalViolations,
                    ];
                }
            }
            usort($bottomPerformersList, fn($a, $b) => $b['count'] <=> $a['count']);
            $bottomPerformers = array_slice($bottomPerformersList, 0, 5);

            // 🟣 Buka Kunci: Permintaan buka kunci presensi pada bulan berjalan
            $mostUnlocked = \Illuminate\Support\Facades\DB::table('attendance_unlocks')
                ->join('employees', 'attendance_unlocks.employee_id', '=', 'employees.id')
                ->whereMonth('attendance_unlocks.date', $currentMonth)
                ->whereYear('attendance_unlocks.date', $currentYear)
                ->select('employees.name', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->groupBy('employees.id', 'employees.name')
                ->orderByDesc('count')
                ->limit(5)
                ->get();

            $executiveStats = [
                'dailyOverview' => $dailyOverview,
                'topPerformers' => $topPerformers,
                'bottomPerformers' => $bottomPerformers,
                'mostUnlocked' => $mostUnlocked,
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

        // Kurikulum stats
        if ($user->hasAnyRole(['Kurikulum', 'Super Admin', 'Kepala Sekolah'])) {
            $roleData['openBursaInvalCount'] = \App\Models\SubstituteTeaching::whereNull('substitute_employee_id')->count();
            $roleData['totalTeachingSchedules'] = \App\Models\TeachingSchedule::count();
        }

        // Admin Absensi / Monitoring stats
        if ($user->hasAnyRole(['Absensi', 'Super Admin', 'Kepala Sekolah'])) {
            $todayCheckedInCount = Attendance::whereDate('date', Carbon::today())->count();
            $totalActiveEmployees = Employee::where('status', 'active')->count();
            $roleData['unrecordedTodayCount'] = max(0, $totalActiveEmployees - $todayCheckedInCount);
            $roleData['todayLatestAttendances'] = Attendance::with('employee')
                ->whereDate('date', Carbon::today())
                ->orderBy('check_in', 'desc')
                ->take(4)
                ->get()
                ->map(fn($att) => [
                    'id' => $att->id,
                    'employee_name' => $att->employee->name ?? 'Pegawai',
                    'check_in' => $att->check_in ? Carbon::parse($att->check_in)->format('H:i') : '-',
                    'status' => $att->status,
                ]);
        }

        // Guru stats
        if ($employee && ($primaryRole === 'Guru' || $user->hasRole('Guru'))) {
            $roleData['availableInvalOffers'] = \App\Models\SubstituteTeaching::with(['absentEmployee', 'teachingSchedule.schoolClass'])
                ->whereNull('substitute_employee_id')
                ->where('absent_employee_id', '!=', $employee->id)
                ->where('date', '>=', Carbon::today()->toDateString())
                ->orderBy('date', 'asc')
                ->take(3)
                ->get()
                ->map(fn($sub) => [
                    'id' => $sub->id,
                    'date' => Carbon::parse($sub->date)->format('d M Y'),
                    'absent_name' => $sub->absentEmployee->name ?? 'Guru',
                    'subject' => $sub->teachingSchedule->subject ?? 'Mapel',
                    'class_name' => $sub->teachingSchedule->schoolClass->name ?? '-',
                ]);
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
            'managementMonthlyStats' => $managementMonthlyStats,
            'dailyTrendStats' => $dailyTrendStats,
            'executiveStats' => $executiveStats,
            'primaryRole' => $primaryRole,
            'roleData' => $roleData,
            'monthlyStats' => [
                'present' => $personalRecap['present'] ?? ($monthlyStatsRaw['present'] ?? 0),
                'late' => $personalRecap['late'] ?? ($monthlyStatsRaw['late'] ?? 0),
                'alpha' => $personalRecap['alpha'] ?? ($monthlyStatsRaw['alpha'] ?? 0),
                'sick' => $personalRecap['sick'] ?? ($monthlyStatsRaw['sick'] ?? 0),
                'permit' => $personalRecap['permit'] ?? ($monthlyStatsRaw['permit'] ?? 0),
                'jtm_scheduled' => $personalRecap['jtm_scheduled'] ?? 0,
                'jtm_present' => $personalRecap['jtm_present'] ?? 0,
                'jtm_inval' => $personalRecap['jtm_inval'] ?? 0,
                'jtm_permit' => $personalRecap['jtm_permit'] ?? 0,
                'jtm_holiday' => $personalRecap['jtm_holiday'] ?? 0,
                'jtm_absent' => $personalRecap['jtm_absent'] ?? 0,
                'has_jtm' => ($personalRecap['jtm_scheduled'] ?? 0) > 0,
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
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->description}). Presensi tidak dapat dilakukan."]);
        }

        $onDinasLuar = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('type', 'izin_dinas_luar')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where(function ($query) use ($now) {
                $query->where('duration_type', 'full_day')
                    ->orWhere(function ($q) use ($now) {
                        $currentTime = $now->toTimeString();
                        $q->where('duration_type', 'partial')
                          ->where('start_time', '<=', $currentTime)
                          ->where('end_time', '>=', $currentTime);
                    });
            })
            ->exists();

        // ── Geofencing ──
        if (!$onDinasLuar) {
            $campus = CampusLocation::findOrFail($request->campus_location_id);
            $distance = $this->haversineDistance(
                $request->latitude, $request->longitude,
                (float)$campus->latitude, (float)$campus->longitude
            );

            if ($distance > $campus->radius) {
                return back()->withErrors(['message' => "Lokasi Anda berada di luar radius {$campus->name} (" . round($distance) . "m dari pusat, batas {$campus->radius}m). Presensi ditolak."]);
            }
        }

        $status = 'present';

        if (!$onDinasLuar) {
            // ── Time blocking ──
            $settings = \App\Models\SystemSetting::pluck('value', 'key');
            $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);
            $jamMasukSetting = $settings['jam_masuk'] ?? '07:00';
            $jamMasuk = Carbon::createFromFormat('H:i', $jamMasukSetting);
            $jamBatas = $jamMasuk->copy()->addMinutes($batasTerlambatMenit);
            $bufferPresensiMasuk = (int)($settings['buffer_presensi_masuk'] ?? 10);
            $batasAwal = $jamMasuk->copy()->subMinutes($bufferPresensiMasuk);

            if ($now->lt($batasAwal)) {
                return back()->withErrors(['message' => "Belum waktunya presensi masuk. Presensi baru dibuka pada pukul " . $batasAwal->format('H:i')]);
            }

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
                $status = $unlock->is_lateness_violation ? 'late' : 'present';
            } elseif ($now->gt($jamMasuk)) {
                $status = 'late';
            }
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
            'is_dinas_luar' => $onDinasLuar,
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
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->description}). Presensi tidak dapat dilakukan."]);
        }

        $onDinasLuar = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('type', 'izin_dinas_luar')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', Carbon::today())
            ->whereDate('end_date', '>=', Carbon::today())
            ->where(function ($query) {
                $now = Carbon::now();
                $query->where('duration_type', 'full_day')
                    ->orWhere(function ($q) use ($now) {
                        $currentTime = $now->toTimeString();
                        $q->where('duration_type', 'partial')
                          ->where('start_time', '<=', $currentTime)
                          ->where('end_time', '>=', $currentTime);
                    });
            })
            ->exists();

        // ── Geofencing ──
        if (!$onDinasLuar) {
            $campus = CampusLocation::findOrFail($request->campus_location_id);
            $distance = $this->haversineDistance(
                $request->latitude, $request->longitude,
                (float)$campus->latitude, (float)$campus->longitude
            );

            if ($distance > $campus->radius) {
                return back()->withErrors(['message' => "Lokasi Anda berada di luar radius {$campus->name} (" . round($distance) . "m dari pusat, batas {$campus->radius}m). Presensi ditolak."]);
            }
        }

        if (!$onDinasLuar) {
            // Validasi jam pulang
            $settings = \App\Models\SystemSetting::pluck('value', 'key');
            $jamKeluarSetting = $settings['jam_keluar'] ?? '14:40';
            $jamKeluar = Carbon::createFromFormat('H:i', $jamKeluarSetting);
            $bufferPresensiKeluar = (int)($settings['buffer_presensi_keluar'] ?? 10);
            $jamBatas = $jamKeluar->copy()->addMinutes($bufferPresensiKeluar);
            $now = Carbon::now();

            $todayStr = Carbon::today()->toDateString();
            $hasIzinPulangCepat = \App\Models\LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->where('type', 'izin_pulang_cepat')
                ->whereDate('start_date', '<=', $todayStr)
                ->whereDate('end_date', '>=', $todayStr)
                ->exists();

            if ($now->lt($jamKeluar) && !$hasIzinPulangCepat) {
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
                    return back()->withErrors(['message' => "Batas presensi keluar ({$jamKeluarSetting} + {$bufferPresensiKeluar} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum untuk membuka akses."]);
                }

                // Mark unlock as used
                $unlock->update(['used' => true]);
            }
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
            'is_dinas_luar' => $attendance->is_dinas_luar || $onDinasLuar,
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
        $employees = Employee::with('positions')->where('status', 'active')->orderBy('name', 'asc')->get();
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
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $roleFilter = $request->input('role', 'all');

        $result = AttendanceRecapService::getMonthlyRecap($month, $year, $roleFilter);

        return Inertia::render('Monitoring/Recap', [
            'recapData' => $result['recapData'],
            'totalStats' => $result['totalStats'],
            'filters' => [
                'month' => $month,
                'year' => $year,
                'role' => $roleFilter,
            ],
            'periodLabel' => $result['periodLabel'],
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
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $roleFilter = $request->input('role', 'all');

        $result = AttendanceRecapService::getMonthlyRecap($month, $year, $roleFilter);

        $recapData = $result['recapData'];
        $stats = $result['totalStats'];
        $monthName = $result['monthName'];
        $periodLabel = $result['periodLabel'];
        $printDate = Carbon::now()->translatedFormat('d F Y, H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.attendance-recap', compact('recapData', 'stats', 'monthName', 'year', 'printDate', 'periodLabel'));
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download("Rekap_Presensi_{$monthName}_{$year}.pdf");
    }

    public function unlockAttendance(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:daily_checkin,daily_checkout,teaching',
            'teaching_schedule_id' => 'nullable|exists:teaching_schedules,id',
            'reason' => 'nullable|string|max:500',
            'expires_in_minutes' => 'required|integer|in:15,30,60',
            'is_lateness_violation' => 'nullable|boolean',
        ]);

        $today = Carbon::today();
        $now = Carbon::now();

        // Check if active (non-expired and unused) unlock already exists
        $query = \App\Models\AttendanceUnlock::where('employee_id', $request->employee_id)
            ->whereDate('date', $today)
            ->where('type', $request->type)
            ->where('used', false)
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            });

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
            'is_lateness_violation' => $request->has('is_lateness_violation') ? (bool)$request->is_lateness_violation : true,
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
