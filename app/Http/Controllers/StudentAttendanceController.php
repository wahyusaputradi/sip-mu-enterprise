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
    /**
     * Kiosk Terminal Scanner Page (Standalone / Gate Scanner Mode)
     */
    public function kiosk()
    {
        $jamMasuk = SystemSetting::where('key', 'student_jam_masuk')->value('value') ?? '07:00';
        $jamPulang = SystemSetting::where('key', 'student_jam_pulang')->value('value') ?? '15:00';
        $toleransi = SystemSetting::where('key', 'student_batas_terlambat_menit')->value('value') ?? '15';

        $todayStats = [
            'total_students' => Student::where('status', 'active')->count(),
            'checked_in' => StudentAttendance::whereDate('date', Carbon::today())->whereNotNull('check_in_time')->count(),
            'late' => StudentAttendance::whereDate('date', Carbon::today())->where('check_in_status', 'late')->count(),
            'checked_out' => StudentAttendance::whereDate('date', Carbon::today())->whereNotNull('check_out_time')->count(),
        ];

        return Inertia::render('StudentAttendance/Kiosk', [
            'settings' => [
                'jam_masuk' => $jamMasuk,
                'jam_pulang' => $jamPulang,
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
                'message' => 'Kartu QR / NIS tidak terdaftar atau akun siswa non-aktif.',
            ], 404);
        }

        $today = Carbon::today();
        $now = Carbon::now();
        $timeStr = $now->format('H:i:s');

        $jamMasukStr = SystemSetting::where('key', 'student_jam_masuk')->value('value') ?? '07:00';
        $toleransiMenit = (int)(SystemSetting::where('key', 'student_batas_terlambat_menit')->value('value') ?? '15');
        $jamPulangStr = SystemSetting::where('key', 'student_jam_pulang')->value('value') ?? '15:00';

        $jamMasuk = Carbon::createFromTimeString($jamMasukStr);
        $jamBatasTerlambat = (clone $jamMasuk)->addMinutes($toleransiMenit);
        $jamPulang = Carbon::createFromTimeString($jamPulangStr);

        $attendance = StudentAttendance::firstOrNew([
            'student_id' => $student->id,
            'date' => $today->toDateString(),
        ]);

        // Determine Mode: Morning Check-in vs Afternoon Check-out
        $isAfternoon = $now->hour >= 12;

        if (!$isAfternoon || !$attendance->check_in_time) {
            // ── CHECK-IN MODE ──
            if ($attendance->check_in_time) {
                // Prevent duplicate scan within 60 seconds
                $lastCheckIn = Carbon::parse($attendance->updated_at);
                if ($now->diffInSeconds($lastCheckIn) < 60) {
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
                        'message' => "Siswa {$student->name} sudah melakukan presensi masuk hari ini.",
                    ]);
                }
            }

            $checkInStatus = $now->gt($jamBatasTerlambat) ? 'late' : 'present';

            $attendance->check_in_time = $timeStr;
            $attendance->check_in_status = $checkInStatus;
            $attendance->scanned_by_user_id = Auth::id();
            $attendance->save();

            // WhatsApp Dispatch (Async-friendly)
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
                    ? "PRESENSI MASUK: {$student->name} (TERLAMBAT)"
                    : "PRESENSI MASUK: {$student->name} (TEPAT WAKTU)",
            ]);
        } else {
            // ── CHECK-OUT MODE ──
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

            $checkOutStatus = $now->lt($jamPulang) ? 'early_leave' : 'normal';

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
        $date = $request->input('date', Carbon::today()->toDateString());
        $classId = $request->input('class_id');
        $search = $request->input('search');
        $statusFilter = $request->input('status', 'all');

        $query = Student::with(['schoolClass', 'attendances' => function ($q) use ($date) {
            $q->whereDate('date', $date);
        }])
        ->where('status', 'active')
        ->when($classId, fn($q, $c) => $q->where('school_class_id', $c))
        ->when($search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('nis', 'like', "%{$s}%"));

        $students = $query->orderBy('name')->get();

        $recap = $students->map(function ($s) {
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

        if ($statusFilter !== 'all') {
            $recap = $recap->filter(fn($r) => $r['status'] === $statusFilter)->values();
        }

        $stats = [
            'total' => $students->count(),
            'present' => $recap->where('status', 'present')->count(),
            'late' => $recap->where('status', 'late')->count(),
            'sick' => $recap->where('status', 'sick')->count(),
            'permit' => $recap->where('status', 'permit')->count(),
            'alpha' => $recap->where('status', 'alpha')->count(),
        ];

        $schoolClasses = SchoolClass::orderBy('name')->get(['id', 'name']);

        return Inertia::render('StudentAttendance/Monitoring', [
            'students' => $recap,
            'stats' => $stats,
            'schoolClasses' => $schoolClasses,
            'filters' => [
                'date' => $date,
                'class_id' => $classId,
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Manual Override for Wali Kelas / Admin (e.g. Set Sick, Permit, Alpha, Present)
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,late,sick,permit,alpha',
            'notes' => 'nullable|string|max:500',
        ]);

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
     * Export Monthly Student Attendance Recap to Excel (.xlsx)
     */
    public function exportMonthlyExcel(Request $request)
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);
        $classId = $request->input('class_id');

        $monthName = Carbon::create()->month($month)->translatedFormat('F');
        $fileName = "Rekap_Presensi_Siswa_{$monthName}_{$year}.xlsx";

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\StudentMonthlyRecapExport($month, $year, $classId),
            $fileName
        );
    }
}
