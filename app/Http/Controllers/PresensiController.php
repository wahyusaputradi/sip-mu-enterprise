<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\TeachingSchedule;
use App\Models\TeachingAttendance;
use App\Models\Attendance;
use App\Models\CampusLocation;
use App\Models\SystemSetting;
use App\Models\AttendanceUnlock;
use App\Models\Holiday;
use Carbon\Carbon;

class PresensiController extends Controller
{
    /**
     * Haversine distance in meters.
     */
    private function haversineDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    /**
     * Main presensi page — role-aware.
     */
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return redirect()->route('dashboard')->withErrors(['message' => 'Data pegawai tidak ditemukan.']);
        }

        $roles = $user->getRoleNames()->toArray();
        $today = Carbon::today();
        $now = Carbon::now();
        $todayDow = $now->dayOfWeekIso; // 1=Monday..5=Friday

        // ── Settings ──
        $settings = SystemSetting::pluck('value', 'key');
        $jamMasuk = $settings['jam_masuk'] ?? '07:00';
        $jamKeluar = $settings['jam_keluar'] ?? '14:40';
        $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);

        // ── Holiday Check ──
        $todayHoliday = Holiday::where('date', $today->toDateString())->first();
        $isHoliday = (bool) $todayHoliday;

        // ── Campus Locations ──
        $campusLocations = CampusLocation::all();

        // ── Role Detection ──
        $employee->load('positions');
        $isGuruMurni = $employee->positions->count() === 1 && $employee->positions->first()?->name === 'Guru';

        // Guru murni → no daily attendance, only per-hour teaching
        // Everyone else → daily attendance required
        $requiresDailyAttendance = !$isGuruMurni;

        // ── Teaching Schedules for today ──
        $schedules = collect();
        $hasTeachingSchedule = false;
        $hourSlots = TeachingSchedule::hourSlots();

        $invalScheduleIds = [];

        if ($todayDow >= 1 && $todayDow <= 5) {
            $schedules = TeachingSchedule::with('schoolClass')
                ->where('employee_id', $employee->id)
                ->where('day_of_week', $todayDow)
                ->orderBy('hour_number')
                ->get();

            // Fetch approved inval schedules for today where this employee is the substitute
            $invalScheduleIds = \App\Models\SubstituteTeaching::where('substitute_employee_id', $employee->id)
                ->where('date', $today->toDateString())
                ->where('status', 'approved')
                ->pluck('teaching_schedule_id')
                ->toArray();

            if (!empty($invalScheduleIds)) {
                $invalSchedules = TeachingSchedule::with(['schoolClass', 'employee']) // Load employee to get original teacher's name
                    ->whereIn('id', $invalScheduleIds)
                    ->orderBy('hour_number')
                    ->get();
                    
                $schedules = $schedules->merge($invalSchedules)->sortBy('hour_number')->values();
            }

            $hasTeachingSchedule = $schedules->isNotEmpty();
        }

        // ── Daily attendance record ──
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        // ── Teaching attendance records ──
        $teachingAttendances = TeachingAttendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->get()
            ->keyBy('teaching_schedule_id');

        // ── Unlocks for today ──
        $unlocks = AttendanceUnlock::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->where('used', false)
            ->where(function ($query) use ($now) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            })
            ->get();

        // ── Time blocking calculations ──
        $currentTimeStr = $now->format('H:i');

        // Daily check-in blocking
        $dailyCheckinBlocked = false;
        $dailyCheckinBlockReason = '';
        $dailyCheckinTooEarly = false;
        $dailyCheckinEarlyTime = '';
        if ($requiresDailyAttendance && !$attendance) {
            $jamMasukCarbon = Carbon::createFromFormat('H:i', $jamMasuk);
            $batasCheckin = $jamMasukCarbon->copy()->addMinutes($batasTerlambatMenit);
            $batasAwalCheckin = $jamMasukCarbon->copy()->subMinutes(10);
            
            if ($now->lt($batasAwalCheckin)) {
                $dailyCheckinTooEarly = true;
                $dailyCheckinEarlyTime = $batasAwalCheckin->format('H:i');
            } elseif ($now->gt($batasCheckin)) {
                // Check if there's an unlock
                $hasUnlock = $unlocks->where('type', 'daily_checkin')->isNotEmpty();
                if (!$hasUnlock) {
                    $dailyCheckinBlocked = true;
                    $dailyCheckinBlockReason = "Batas presensi masuk ({$jamMasuk} + {$batasTerlambatMenit} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum untuk membuka akses.";
                }
            }
        }

        // Daily check-out: only after jam_keluar
        $dailyCheckoutAvailable = false;
        $dailyCheckoutBlocked = false;
        $dailyCheckoutBlockReason = '';

        if ($attendance && !$attendance->check_out) {
            $dailyCheckoutAvailable = $currentTimeStr >= $jamKeluar;

            if ($dailyCheckoutAvailable) {
                $jamKeluarCarbon = Carbon::createFromFormat('H:i', $jamKeluar);
                $batasCheckout = $jamKeluarCarbon->copy()->addMinutes($batasTerlambatMenit);
                
                if ($now->gt($batasCheckout)) {
                    $hasUnlock = $unlocks->where('type', 'daily_checkout')->isNotEmpty();
                    if (!$hasUnlock) {
                        $dailyCheckoutBlocked = true;
                        $dailyCheckoutBlockReason = "Batas presensi keluar ({$jamKeluar} + {$batasTerlambatMenit} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum.";
                    }
                }
            }
        }

        // ── Build schedule data with time-block status ──
        $scheduleData = [];
        if ($hasTeachingSchedule) {
            foreach ($schedules as $schedule) {
                $slot = $hourSlots[$schedule->hour_number] ?? null;
                $hasAttended = $teachingAttendances->has($schedule->id);
                $attendanceTime = $hasAttended ? $teachingAttendances[$schedule->id]->time : null;

                $blocked = false;
                $blockReason = '';

                if (!$hasAttended && $slot) {
                    $slotStart = Carbon::createFromFormat('H:i', $slot['start']);
                    $slotEnd = Carbon::createFromFormat('H:i', $slot['end']);
                    $slotDeadline = $slotStart->copy()->addMinutes($batasTerlambatMenit);

                    if ($now->gt($slotDeadline)) {
                        // Past deadline — check for unlock
                        $hasUnlock = $unlocks->where('type', 'teaching')
                            ->where('teaching_schedule_id', $schedule->id)
                            ->isNotEmpty();
                        if (!$hasUnlock) {
                            $blocked = true;
                            $blockReason = "Batas presensi Jam ke-{$schedule->hour_number} ({$slot['start']} + {$batasTerlambatMenit} menit) telah terlewat.";
                        }
                    }

                    // Not yet started
                    $notYet = $now->lt($slotStart);
                }

                $scheduleData[] = [
                    'id' => $schedule->id,
                    'hour_number' => $schedule->hour_number,
                    'subject' => $schedule->subject,
                    'school_class' => $schedule->schoolClass ? ['name' => $schedule->schoolClass->name] : null,
                    'time_start' => $slot['start'] ?? null,
                    'time_end' => $slot['end'] ?? null,
                    'has_attended' => $hasAttended,
                    'attendance_time' => $attendanceTime ? Carbon::parse($attendanceTime)->format('H:i') : null,
                    'blocked' => $blocked,
                    'block_reason' => $blockReason,
                    'not_yet' => $notYet ?? false,
                    'is_inval' => in_array($schedule->id, $invalScheduleIds),
                    'original_teacher_name' => $schedule->employee ? $schedule->employee->name : null,
                ];
            }
        }

        // ── Check unlock info (for display) ──
        $activeUnlocks = $unlocks->map(function ($u) {
            return [
                'type' => $u->type,
                'teaching_schedule_id' => $u->teaching_schedule_id,
                'unlocked_by_name' => $u->unlockedByUser?->name ?? 'Admin',
                'expires_at' => $u->expires_at ? $u->expires_at->format('Y-m-d H:i:s') : null,
            ];
        });

        return Inertia::render('Attendance/Presensi', [
            'requiresDailyAttendance' => $requiresDailyAttendance,
            'hasTeachingSchedule' => $hasTeachingSchedule,
            'isGuruMurni' => $isGuruMurni,
            'isHoliday' => $isHoliday,
            'holidayInfo' => $todayHoliday ? ['name' => $todayHoliday->name, 'date' => $todayHoliday->date] : null,
            'today' => $today->translatedFormat('l, d F Y'),
            'currentTime' => $currentTimeStr,
            'attendance' => $attendance ? [
                'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('H:i') : null,
                'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('H:i') : null,
            ] : null,
            'schedules' => $scheduleData,
            'campusLocations' => $campusLocations->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'latitude' => (float) $c->latitude,
                'longitude' => (float) $c->longitude,
                'radius' => (int) $c->radius,
            ]),
            'settings' => [
                'jam_masuk' => $jamMasuk,
                'jam_keluar' => $jamKeluar,
                'batas_terlambat' => $batasTerlambatMenit,
            ],
            'dailyCheckinBlocked' => $dailyCheckinBlocked,
            'dailyCheckinBlockReason' => $dailyCheckinBlockReason,
            'dailyCheckinTooEarly' => $dailyCheckinTooEarly,
            'dailyCheckinEarlyTime' => $dailyCheckinEarlyTime,
            'dailyCheckoutAvailable' => $dailyCheckoutAvailable,
            'dailyCheckoutBlocked' => $dailyCheckoutBlocked,
            'dailyCheckoutBlockReason' => $dailyCheckoutBlockReason,
            'activeUnlocks' => $activeUnlocks,
            'userRoles' => $roles,
        ]);
    }

    /**
     * Store guru per-hour attendance with geofencing & time validation.
     */
    public function storeGuru(Request $request)
    {
        $request->validate([
            'teaching_schedule_id' => 'required|exists:teaching_schedules,id',
            'campus_location_id' => 'required|exists:campus_locations,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo' => 'required|string',
        ]);

        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->withErrors(['message' => 'Data pegawai tidak ditemukan.']);
        }

        $today = Carbon::today();
        $now = Carbon::now();

        // ── Holiday Check ──
        $todayHoliday = Holiday::where('date', $today->toDateString())->first();
        if ($todayHoliday) {
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->name}). Presensi tidak dapat dilakukan."]);
        }

        // ── Check duplicate ──
        $exists = TeachingAttendance::where('employee_id', $employee->id)
            ->where('teaching_schedule_id', $request->teaching_schedule_id)
            ->whereDate('date', $today)
            ->exists();

        if ($exists) {
            return back()->withErrors(['message' => 'Anda sudah melakukan presensi untuk jam pelajaran ini.']);
        }

        // ── Geofencing validation ──
        $campus = CampusLocation::findOrFail($request->campus_location_id);
        $distance = $this->haversineDistance(
            $request->latitude, $request->longitude,
            (float)$campus->latitude, (float)$campus->longitude
        );

        if ($distance > $campus->radius) {
            return back()->withErrors(['message' => "Lokasi Anda berada di luar radius {$campus->name} (" . round($distance) . "m dari pusat, batas {$campus->radius}m). Presensi ditolak."]);
        }

        // ── Check if it's an inval schedule ──
        $isInval = \App\Models\SubstituteTeaching::where('substitute_employee_id', $employee->id)
            ->where('teaching_schedule_id', $request->teaching_schedule_id)
            ->where('date', $today->toDateString())
            ->where('status', 'approved')
            ->exists();

        // ── Time validation ──
        $schedule = TeachingSchedule::findOrFail($request->teaching_schedule_id);
        
        // ── Validation: User must either own the schedule or be an approved substitute ──
        if ($schedule->employee_id !== $employee->id && !$isInval) {
            return back()->withErrors(['message' => 'Anda tidak memiliki hak untuk melakukan presensi pada jadwal ini.']);
        }

        $hourSlots = TeachingSchedule::hourSlots();
        $slot = $hourSlots[$schedule->hour_number] ?? null;
        $settings = SystemSetting::pluck('value', 'key');
        $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);

        $status = 'present';

        if ($slot) {
            $slotStart = Carbon::createFromFormat('H:i', $slot['start']);
            $slotDeadline = $slotStart->copy()->addMinutes($batasTerlambatMenit);

            if ($now->lt($slotStart)) {
                return back()->withErrors(['message' => "Belum waktunya jam pelajaran ke-{$schedule->hour_number}. Sesi baru dimulai pada pukul " . $slot['start']]);
            }

            if ($now->gt($slotDeadline)) {
                // Check for unlock token
                $unlock = AttendanceUnlock::where('employee_id', $employee->id)
                    ->whereDate('date', $today)
                    ->where('type', 'teaching')
                    ->where('teaching_schedule_id', $schedule->id)
                    ->where('used', false)
                    ->where(function ($query) use ($now) {
                        $query->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
                    })
                    ->first();

                if (!$unlock) {
                    return back()->withErrors(['message' => "Batas waktu presensi Jam ke-{$schedule->hour_number} ({$slot['start']} + {$batasTerlambatMenit} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum."]);
                }

                // Mark unlock as used
                $unlock->update(['used' => true]);
                $status = 'late';
            } elseif ($now->gt($slotStart)) {
                $status = 'late';
            }
        }

        $photoPath = null;
        if ($request->photo) {
            $slugName = \Illuminate\Support\Str::slug($employee->name, '_');
            $dayName = Carbon::now()->translatedFormat('l');
            $dateStr = Carbon::now()->format('d-m-Y');
            $timeStr = Carbon::now()->format('H-i-s');
            $fileName = "{$slugName}_jam{$schedule->hour_number}_{$dayName}_{$dateStr}_{$timeStr}";

            $compressor = app(\App\Services\ImageCompressionService::class);
            $photoPath = $compressor->compressFromBase64(
                $request->photo,
                'attendances/teaching',
                $fileName,
                'attendance'
            );

            if ($photoPath === null) {
                return back()->withErrors(['message' => 'Format foto presensi tidak valid atau gagal diproses.']);
            }
        }

        TeachingAttendance::create([
            'employee_id' => $employee->id,
            'teaching_schedule_id' => $request->teaching_schedule_id,
            'date' => $today,
            'time' => $now->toTimeString(),
            'photo' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'campus_location_id' => $request->campus_location_id,
            'status' => $status,
        ]);

        // Increment teaching_hours on daily attendance record
        $dailyAtt = Attendance::firstOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            [
                'status' => 'present',
                'check_in' => $now->toTimeString(),
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'campus_location_id' => $request->campus_location_id,
            ]
        );
        
        if (!$isInval) {
            $dailyAtt->increment('teaching_hours', 1);
        }

        $statusMsg = $status === 'late' ? 'Presensi Jam ke-' . $schedule->hour_number . ' berhasil (Terlambat).' : 'Presensi Jam ke-' . $schedule->hour_number . ' berhasil!';
        return back()->with('message', $statusMsg);
    }
}
