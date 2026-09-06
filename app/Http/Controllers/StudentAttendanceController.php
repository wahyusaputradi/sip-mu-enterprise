<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\SchoolClass;
use App\Models\SystemSetting;
use App\Services\WhatsAppNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class StudentAttendanceController extends Controller
{
    private function isReadOnlyUser(): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole('Kesiswaan');
    }

    private function getTeacherClassIds(): array
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole('Guru')) {
            return [];
        }

        $employee = $user->employee;
        if (!$employee) {
            return [];
        }

        $classIds = SchoolClass::where('homeroom_teacher_id', $employee->id)->pluck('id')->toArray();
        if (empty($classIds) && !empty($employee->homeroom_class)) {
            $classIds = SchoolClass::where('name', $employee->homeroom_class)->pluck('id')->toArray();
        }
        return $classIds;
    }

    private function validateHomeroomTeacherAccess(): void
    {
        $user = auth()->user();
        if (!$user) return;

        $isGuru = $user->hasRole('Guru');
        $isManagementOrKesiswaan = $user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Kesiswaan']);

        if ($isGuru && !$isManagementOrKesiswaan) {
            $teacherClassIds = $this->getTeacherClassIds();
            if (empty($teacherClassIds)) {
                abort(403, 'Akses ditolak. Menu ini hanya dapat diakses oleh Guru yang bertugas sebagai Wali Kelas.');
            }
        }
    }

    /**
     * Kiosk Terminal Scanner Page (Standalone / Gate Scanner Mode)
     */
    public function kiosk()
    {
        $jamMasukBuka = SystemSetting::where('key', 'student_jam_masuk_buka')->value('value') ?? '06:00';
        $jamMasuk = SystemSetting::where('key', 'student_jam_masuk')->value('value') ?? '07:00';
        $jamPulang = SystemSetting::where('key', 'student_jam_pulang')->value('value') ?? '15:00';
        $jamPulangTutup = SystemSetting::where('key', 'student_jam_pulang_tutup')->value('value') ?? '17:30';
        $toleransi = SystemSetting::where('key', 'student_batas_terlambat_menit')->value('value') ?? '15';

        $todayStats = [
            'total_students' => Student::where('status', 'active')->count(),
            'checked_in' => StudentAttendance::whereDate('date', Carbon::today())->whereNotNull('check_in_time')->count(),
            'late' => StudentAttendance::whereDate('date', Carbon::today())->where('check_in_status', 'late')->count(),
            'checked_out' => StudentAttendance::whereDate('date', Carbon::today())->whereNotNull('check_out_time')->count(),
        ];

        return Inertia::render('StudentAttendance/Kiosk', [
            'settings' => [
                'jam_masuk_buka' => $jamMasukBuka,
                'jam_masuk' => $jamMasuk,
                'jam_pulang' => $jamPulang,
                'jam_pulang_tutup' => $jamPulangTutup,
                'toleransi_menit' => (int)$toleransi,
            ],
            'todayStats' => $todayStats,
        ]);
    }

    /**
     * Fast API endpoint called by QR Barcode Scanner Kiosk
     */
    public function scanQr(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string',
        ]);

        $token = trim($request->input('qr_token'));
        $student = Student::with('schoolClass')
            ->where('status', 'active')
            ->where(function ($q) use ($token) {
                $q->where('qr_token', $token)->orWhere('nis', $token);
            })
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Kartu QR tidak dikenali / siswa tidak aktif.',
            ], 404);
        }

        $now = Carbon::now();
        $dateStr = $now->toDateString();
        $timeStr = $now->toTimeString();

        $jamMasukBukaStr = SystemSetting::where('key', 'student_jam_masuk_buka')->value('value') ?? '06:00';
        $jamMasukStr = SystemSetting::where('key', 'student_jam_masuk')->value('value') ?? '07:00';
        $toleransi = (int)(SystemSetting::where('key', 'student_batas_terlambat_menit')->value('value') ?? 15);
        $jamPulangStr = SystemSetting::where('key', 'student_jam_pulang')->value('value') ?? '15:00';
        $jamPulangTutupStr = SystemSetting::where('key', 'student_jam_pulang_tutup')->value('value') ?? '17:30';

        $jamMasukBuka = Carbon::parse($dateStr . ' ' . $jamMasukBukaStr);
        $jamMasuk = Carbon::parse($dateStr . ' ' . $jamMasukStr);
        $jamBatasTerlambat = Carbon::parse($dateStr . ' ' . $jamMasukStr)->addMinutes($toleransi);
        $jamPulang = Carbon::parse($dateStr . ' ' . $jamPulangStr);
        $jamPulangTutup = Carbon::parse($dateStr . ' ' . $jamPulangTutupStr);

        $attendance = StudentAttendance::where('student_id', $student->id)
            ->whereDate('date', $dateStr)
            ->first() ?? new StudentAttendance([
                'student_id' => $student->id,
                'date' => $dateStr,
            ]);

        if (!$attendance->check_in_time) {
            // ── CHECK-IN MODE ──

            // 1. Cek apakah belum masuk jam buka presensi
            if ($now->lt($jamMasukBuka)) {
                return response()->json([
                    'success' => false,
                    'mode' => 'check_in',
                    'message' => "Presensi Masuk Belum Dibuka. Gerbang presensi dibuka jam {$jamMasukBukaStr} WIB.",
                ], 400);
            }

            // 2. Cek apakah waktu presensi telah melebihi batas keterlambatan & terblokir (jika belum di-unblock)
            if ($now->gt($jamBatasTerlambat) && !$attendance->is_unlocked) {
                return response()->json([
                    'success' => false,
                    'mode' => 'check_in',
                    'status' => 'blocked',
                    'student' => [
                        'name' => $student->name,
                        'nis' => $student->nis,
                        'class_name' => $student->schoolClass?->name ?? '-',
                        'photo' => $student->photo,
                    ],
                    'message' => "Presensi Masuk Ditutup / Terblokir. Waktu presensi masuk telah berakhir ({$jamBatasTerlambat->format('H:i')} WIB). Silakan minta pembukaan blokir ke Wali Kelas atau Tim Kesiswaan/Absensi.",
                ], 423);
            }

            $checkInStatus = $now->gt($jamBatasTerlambat) ? 'late' : 'present';

            $attendance->check_in_time = $timeStr;
            $attendance->check_in_status = $checkInStatus;
            $attendance->scanned_by_user_id = Auth::id();
            $attendance->save();

            WhatsAppNotificationService::sendAttendanceNotification($student, 'check_in', $now->format('H:i'), $checkInStatus);

            return response()->json([
                'success' => true,
                'already_scanned' => false,
                'mode' => 'check_in',
                'student' => [
                    'name' => $student->name,
                    'nis' => $student->nis,
                    'class_name' => $student->schoolClass?->name ?? '-',
                    'photo' => $student->photo,
                ],
                'time' => $now->format('H:i'),
                'status' => $checkInStatus,
                'message' => $checkInStatus === 'late'
                    ? "PRESENSI MASUK: {$student->name} (TERLAMBAT - DIUNBLOCK)"
                    : "PRESENSI MASUK: {$student->name} (TEPAT WAKTU)",
            ]);
        } else {
            // ── CHECK-OUT MODE / PREVENT ACCIDENTAL RE-SCAN ──
            $checkInDateTime = Carbon::parse($dateStr . ' ' . $attendance->check_in_time);
            
            // Jeda minimal 15 menit antara presensi masuk & pulang
            if (abs($now->diffInMinutes($checkInDateTime)) < 15) {
                return response()->json([
                    'success' => true,
                    'already_scanned' => true,
                    'mode' => 'check_in',
                    'student' => [
                        'name' => $student->name,
                        'nis' => $student->nis,
                        'class_name' => $student->schoolClass?->name ?? '-',
                        'photo' => $student->photo,
                    ],
                    'time' => Carbon::parse($attendance->check_in_time)->format('H:i'),
                    'status' => $attendance->check_in_status,
                    'message' => "Siswa {$student->name} telah presensi masuk pada jam " . Carbon::parse($attendance->check_in_time)->format('H:i') . " WIB.",
                ]);
            }

            // Cek apakah presensi pulang belum dibuka
            if ($now->lt($jamPulang)) {
                return response()->json([
                    'success' => false,
                    'mode' => 'check_out',
                    'message' => "Presensi Pulang Belum Dibuka. Jam pulang sekolah: {$jamPulangStr} WIB.",
                ], 400);
            }

            // Cek apakah presensi pulang sudah ditutup
            if ($now->gt($jamPulangTutup)) {
                return response()->json([
                    'success' => false,
                    'mode' => 'check_out',
                    'message' => "Presensi Pulang Sudah Ditutup. Batas akhir presensi pulang: {$jamPulangTutupStr} WIB.",
                ], 400);
            }

            if ($attendance->check_out_time) {
                return response()->json([
                    'success' => true,
                    'already_scanned' => true,
                    'mode' => 'check_out',
                    'student' => [
                        'name' => $student->name,
                        'nis' => $student->nis,
                        'class_name' => $student->schoolClass?->name ?? '-',
                        'photo' => $student->photo,
                    ],
                    'time' => Carbon::parse($attendance->check_out_time)->format('H:i'),
                    'status' => $attendance->check_out_status,
                    'message' => "Siswa {$student->name} sudah melakukan presensi pulang hari ini.",
                ]);
            }

            $checkOutStatus = 'normal';

            $attendance->check_out_time = $timeStr;
            $attendance->check_out_status = $checkOutStatus;
            $attendance->save();

            WhatsAppNotificationService::sendAttendanceNotification($student, 'check_out', $now->format('H:i'), $checkOutStatus);

            return response()->json([
                'success' => true,
                'already_scanned' => false,
                'mode' => 'check_out',
                'student' => [
                    'name' => $student->name,
                    'nis' => $student->nis,
                    'class_name' => $student->schoolClass?->name ?? '-',
                    'photo' => $student->photo,
                ],
                'time' => $now->format('H:i'),
                'status' => $checkOutStatus,
                'message' => "PRESENSI PULANG: {$student->name} (PULANG SEKOLAH)",
            ]);
        }
    }

    /**
     * Unblock late student check-in access (Homeroom Teacher / Kesiswaan / Management Override)
     */
    public function unblockAndCheckIn(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'reason' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $student = Student::with('schoolClass')->findOrFail($request->student_id);

        // Check role & homeroom teacher scope
        $isGuru = $user->hasRole('Guru');
        $isManagementOrKesiswaan = $user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Kesiswaan']);

        if ($isGuru && !$isManagementOrKesiswaan) {
            $teacherClassIds = $this->getTeacherClassIds();
            if (!in_array($student->school_class_id, $teacherClassIds)) {
                return back()->withErrors(['message' => 'Anda hanya berhak membuka blokir presensi untuk siswa di kelas diampu Anda.']);
            }
        } elseif (!$isGuru && !$isManagementOrKesiswaan) {
            return back()->withErrors(['message' => 'Anda tidak memiliki hak akses untuk membuka blokir presensi siswa.']);
        }

        $now = Carbon::now();
        $dateStr = $now->toDateString();
        $timeStr = $now->toTimeString();

        $attendance = StudentAttendance::where('student_id', $student->id)
            ->whereDate('date', $dateStr)
            ->first() ?? new StudentAttendance([
                'student_id' => $student->id,
                'date' => $dateStr,
            ]);

        $attendance->check_in_time = $timeStr;
        $attendance->check_in_status = 'late';
        $attendance->is_unlocked = true;
        $attendance->unlocked_by_user_id = $user->id;
        $attendance->unlocked_reason = $request->reason;
        $attendance->scanned_by_user_id = $user->id;
        $attendance->save();

        WhatsAppNotificationService::sendAttendanceNotification($student, 'check_in', $now->format('H:i'), 'late');

        return back()->with('message', "Akses presensi siswa {$student->name} berhasil dibuka dan dicatat sebagai Hadir Terlambat.");
    }

    /**
     * Bulk Sync Offline Buffer Scans from Kiosk IndexedDB
     */
    public function syncOffline(Request $request)
    {
        $request->validate([
            'scans' => 'required|array',
            'scans.*.qr_token' => 'required|string',
            'scans.*.timestamp' => 'required|string',
        ]);

        $syncedCount = 0;
        foreach ($request->input('scans') as $scan) {
            $student = Student::where('qr_token', $scan['qr_token'])->orWhere('nis', $scan['qr_token'])->first();
            if ($student) {
                $scanTime = Carbon::parse($scan['timestamp']);
                $dateStr = $scanTime->toDateString();
                $timeStr = $scanTime->toTimeString();

                $att = StudentAttendance::firstOrNew([
                    'student_id' => $student->id,
                    'date' => $dateStr,
                ]);

                if (!$att->check_in_time) {
                    $att->check_in_time = $timeStr;
                    $att->check_in_status = 'present';
                    $att->save();
                    $syncedCount++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil sinkronisasi {$syncedCount} data presensi offline.",
        ]);
    }

    /**
     * Admin & Wali Kelas Monitoring Dashboard Page
     */
    public function monitoring(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $date = $request->input('date', Carbon::today()->toDateString());
        $classId = $request->input('class_id');
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'all');

        $user = auth()->user();
        $isGuru = $user && $user->hasRole('Guru');
        $teacherClassIds = $this->getTeacherClassIds();

        $query = Student::with(['schoolClass', 'attendances' => function ($q) use ($date) {
            $q->whereDate('date', $date);
        }])
        ->where('status', 'active')
        ->when($isGuru && !empty($teacherClassIds), fn($q) => $q->whereIn('school_class_id', $teacherClassIds))
        ->when($classId, fn($q, $c) => $q->where('school_class_id', $c))
        ->when($search, fn($q, $s) => $q->where(function($sq) use ($s) {
            $sq->where('name', 'like', "%{$s}%")->orWhere('nis', 'like', "%{$s}%");
        }));

        $allStudents = $query->orderBy('name')->get();

        $allRecap = $allStudents->map(function ($s) {
            $att = $s->attendances->first();
            return [
                'id' => $s->id,
                'nis' => $s->nis,
                'name' => $s->name,
                'class_name' => $s->schoolClass?->name ?? '-',
                'school_class_id' => $s->school_class_id,
                'parent_phone' => $s->parent_phone,
                'attendance_id' => $att?->id,
                'check_in_time' => $att?->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                'check_out_time' => $att?->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                'status' => $att?->check_in_status ?? 'alpha',
                'notes' => $att?->notes,
            ];
        });

        $stats = [
            'total' => $allRecap->count(),
            'present' => $allRecap->where('status', 'present')->count(),
            'late' => $allRecap->where('status', 'late')->count(),
            'sick' => $allRecap->where('status', 'sick')->count(),
            'permit' => $allRecap->where('status', 'permit')->count(),
            'alpha' => $allRecap->where('status', 'alpha')->count(),
        ];

        if ($statusFilter !== 'all') {
            $allRecap = $allRecap->filter(fn($r) => $r['status'] === $statusFilter)->values();
        }

        // Paginate 50 items per page
        $page = (int) $request->input('page', 1);
        $perPage = 50;
        $totalItems = $allRecap->count();
        $slicedData = $allRecap->slice(($page - 1) * $perPage, $perPage)->values();

        $paginatedStudents = new \Illuminate\Pagination\LengthAwarePaginator(
            $slicedData,
            $totalItems,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $classesQuery = SchoolClass::orderBy('name');
        if ($isGuru && !empty($teacherClassIds)) {
            $classesQuery->whereIn('id', $teacherClassIds);
        }
        $schoolClasses = $classesQuery->get(['id', 'name']);

        return Inertia::render('StudentAttendance/Monitoring', [
            'students' => $paginatedStudents,
            'stats' => $stats,
            'schoolClasses' => $schoolClasses,
            'filters' => [
                'date' => $date,
                'class_id' => $classId,
                'search' => $search,
                'status' => $statusFilter,
            ],
            'isReadOnly' => $this->isReadOnlyUser(),
            'isHomeroomTeacher' => $isGuru && !empty($teacherClassIds),
        ]);
    }

    /**
     * Manual Override for Wali Kelas / Admin (e.g. Set Sick, Permit, Alpha, Present)
     */
    public function updateStatus(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,late,sick,permit,alpha',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user && $user->hasRole('Guru')) {
            $student = Student::find($validated['student_id']);
            if (!$student || empty($teacherClassIds) || !in_array($student->school_class_id, $teacherClassIds)) {
                abort(403, 'Anda hanya dapat memperbarui status presensi siswa di kelas yang Anda ampu.');
            }
        }

        $attendance = StudentAttendance::firstOrNew([
            'student_id' => $validated['student_id'],
            'date' => $validated['date'],
        ]);

        $attendance->check_in_status = $validated['status'];
        if ($validated['status'] === 'present' && !$attendance->check_in_time) {
            $attendance->check_in_time = '07:00:00';
        }
        $attendance->notes = $validated['notes'] ?? null;
        $attendance->scanned_by_user_id = Auth::id();
        $attendance->save();

        return back()->with('message', 'Status presensi siswa berhasil diperbarui.');
    }

    /**
     * Dedicated Monthly Student Attendance Recap Page
     */
    public function recap(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $classId = $request->input('class_id');
        $search = $request->input('search');

        $user = auth()->user();
        $isGuru = $user && $user->hasRole('Guru');
        $teacherClassIds = $this->getTeacherClassIds();

        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        $studentsQuery = Student::with(['schoolClass', 'attendances' => function ($q) use ($year, $month) {
            $q->whereYear('date', $year)->whereMonth('date', $month);
        }])
        ->where('status', 'active')
        ->when($isGuru && !empty($teacherClassIds), fn($q) => $q->whereIn('school_class_id', $teacherClassIds))
        ->when($classId, fn($q, $c) => $q->where('school_class_id', $c))
        ->when($search, fn($q, $s) => $q->where(function($sq) use ($s) {
            $sq->where('name', 'like', "%{$s}%")->orWhere('nis', 'like', "%{$s}%");
        }));

        // Compute grand totals across all matching students
        $allStudentsForStats = (clone $studentsQuery)->get();
        $grandTotals = [
            'total' => $allStudentsForStats->count(),
            'present' => 0,
            'late' => 0,
            'sick' => 0,
            'permit' => 0,
            'alpha' => 0,
        ];
        foreach ($allStudentsForStats as $st) {
            foreach ($st->attendances as $att) {
                if ($att->check_in_status === 'present') $grandTotals['present']++;
                elseif ($att->check_in_status === 'late') $grandTotals['late']++;
                elseif ($att->check_in_status === 'sick') $grandTotals['sick']++;
                elseif ($att->check_in_status === 'permit') $grandTotals['permit']++;
                elseif ($att->check_in_status === 'alpha') $grandTotals['alpha']++;
            }
        }

        // Paginate 50 students per page
        $paginatedStudents = $studentsQuery->orderBy('name')->paginate(50)->withQueryString();

        $paginatedStudents->getCollection()->transform(function ($student) use ($daysInMonth) {
            $attMap = $student->attendances->keyBy(function ($item) {
                return (int) Carbon::parse($item->date)->format('j');
            });

            $daily = [];
            $present = 0;
            $late = 0;
            $sick = 0;
            $permit = 0;
            $alpha = 0;

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $status = $attMap->has($d) ? $attMap[$d]->check_in_status : null;
                $daily[$d] = $status;

                if ($status === 'present') $present++;
                elseif ($status === 'late') $late++;
                elseif ($status === 'sick') $sick++;
                elseif ($status === 'permit') $permit++;
                elseif ($status === 'alpha') $alpha++;
            }

            return [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'class_name' => $student->schoolClass?->name ?? '-',
                'daily' => $daily,
                'stats' => [
                    'present' => $present,
                    'late' => $late,
                    'sick' => $sick,
                    'permit' => $permit,
                    'alpha' => $alpha,
                    'total_recorded' => $present + $late + $sick + $permit + $alpha,
                ],
            ];
        });

        $classesQuery = SchoolClass::orderBy('name');
        if ($isGuru && !empty($teacherClassIds)) {
            $classesQuery->whereIn('id', $teacherClassIds);
        }
        $schoolClasses = $classesQuery->get(['id', 'name']);

        return Inertia::render('StudentAttendance/Recap', [
            'matrix' => $paginatedStudents,
            'grandTotals' => $grandTotals,
            'schoolClasses' => $schoolClasses,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'class_id' => $classId,
                'search' => $search,
            ],
            'isReadOnly' => $this->isReadOnlyUser(),
            'isHomeroomTeacher' => $isGuru && !empty($teacherClassIds),
        ]);
    }

    /**
     * Export Monthly Student Attendance Recap to Excel (.xlsx)
     */
    public function exportMonthlyExcel(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $classId = $request->input('class_id');

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user && $user->hasRole('Guru') && !empty($teacherClassIds)) {
            if (!$classId || !in_array($classId, $teacherClassIds)) {
                $classId = $teacherClassIds[0];
            }
        }

        $monthName = Carbon::create()->month($month)->translatedFormat('F');
        $fileName = "Rekap_Presensi_Siswa_{$monthName}_{$year}.xlsx";

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\StudentMonthlyRecapExport($month, $year, $classId),
            $fileName
        );
    }
}
