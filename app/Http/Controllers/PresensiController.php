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

        // ── Settings ──
        $settings = SystemSetting::pluck('value', 'key');
        $jamMasuk = $settings['jam_masuk'] ?? '07:00';
        $jamKeluar = $settings['jam_keluar'] ?? '14:40';
        $batasTerlambatMenit = (int)($settings['batas_waktu_maksimal_terlambat'] ?? 10);
        $teachingLateTolerance = (int)($settings['teaching_late_tolerance'] ?? 10);

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
        if ($requiresDailyAttendance && !$attendance && !$onDinasLuar) {
            $jamMasukCarbon = Carbon::createFromFormat('H:i', $jamMasuk);
            $batasCheckin = $jamMasukCarbon->copy()->addMinutes($batasTerlambatMenit);
            $bufferPresensiMasuk = (int)($settings['buffer_presensi_masuk'] ?? 10);
            $batasAwalCheckin = $jamMasukCarbon->copy()->subMinutes($bufferPresensiMasuk);
            
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

        // Cek apakah ada Izin Pulang Cepat yang disetujui untuk hari ini
        $todayStr = $today->toDateString();
        $hasIzinPulangCepat = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('type', 'izin_pulang_cepat')
            ->whereDate('start_date', '<=', $todayStr)
            ->whereDate('end_date', '>=', $todayStr)
            ->exists();

        if ($attendance && !$attendance->check_out) {
            $dailyCheckoutAvailable = ($currentTimeStr >= $jamKeluar) || $hasIzinPulangCepat || $onDinasLuar;

            if ($dailyCheckoutAvailable && !$onDinasLuar) {
                $jamKeluarCarbon = Carbon::createFromFormat('H:i', $jamKeluar);
                $bufferPresensiKeluar = (int)($settings['buffer_presensi_keluar'] ?? 10);
                $batasCheckout = $jamKeluarCarbon->copy()->addMinutes($bufferPresensiKeluar);
                
                if ($now->gt($batasCheckout)) {
                    $hasUnlock = $unlocks->where('type', 'daily_checkout')->isNotEmpty();
                    if (!$hasUnlock) {
                        $dailyCheckoutBlocked = true;
                        $dailyCheckoutBlockReason = "Batas presensi keluar ({$jamKeluar} + {$bufferPresensiKeluar} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum.";
                    }
                }
            }
        }

        // Fetch all approved Dinas Luar for today to check per-slot overlaps
        $todayDinasLuar = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('type', 'izin_dinas_luar')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->get();

        // ── Build schedule data with time-block status ──
        $scheduleData = [];
        if ($hasTeachingSchedule) {
            foreach ($schedules as $schedule) {
                $slot = $hourSlots[$schedule->hour_number] ?? null;
                $hasAttended = $teachingAttendances->has($schedule->id);
                $attendanceTime = $hasAttended ? $teachingAttendances[$schedule->id]->time : null;

                $isInval = in_array($schedule->id, $invalScheduleIds);
                $blocked = false;
                $blockReason = '';
                $notYet = false;

                $slotOnDinasLuar = false;
                if ($slot) {
                    $slotOnDinasLuar = $todayDinasLuar->contains(function ($lr) use ($slot) {
                        if ($lr->duration_type === 'full_day') {
                            return true;
                        }
                        return $lr->start_time <= $slot['end'] && $lr->end_time >= $slot['start'];
                    });
                }

                $slotStart = $slot ? Carbon::createFromFormat('H:i', $slot['start']) : null;
                $slotEnd = $slot ? Carbon::createFromFormat('H:i', $slot['end']) : null;
                $isPastSlot = $slotEnd ? $now->gt($slotEnd) : false;

                // For hour 10 (last hour), open time is slot['end'] (14:40) instead of slot['start'] (14:00)
                $openTime = ($slot && $schedule->hour_number == 10) ? $slotEnd : $slotStart;

                if (!$hasAttended && $slot) {
                    $slotDeadline = $openTime->copy()->addMinutes($teachingLateTolerance);

                    // If it is an inval schedule or on Dinas Luar, bypass the slot deadline block
                    if (!$isInval && !$slotOnDinasLuar && $now->gt($slotDeadline)) {
                        // Past deadline — check for unlock
                        $hasUnlock = $unlocks->where('type', 'teaching')
                            ->where('teaching_schedule_id', $schedule->id)
                            ->isNotEmpty();
                        if (!$hasUnlock) {
                            $blocked = true;
                            $openStr = ($schedule->hour_number == 10) ? $slot['end'] : $slot['start'];
                            $blockReason = "Batas presensi Jam ke-{$schedule->hour_number} ({$openStr} + {$teachingLateTolerance} menit) telah terlewat.";
                        }
                    }

                    // Not yet started
                    $notYet = $now->lt($openTime);
                }

                $showDinasLuarBadge = false;
                $isDinasLuarActive = !$hasAttended && $slotOnDinasLuar;

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
                    'is_dinas_luar' => $showDinasLuarBadge,
                    'is_dinas_luar_active' => $isDinasLuarActive,
                    'is_inval' => $isInval,
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
            'serverTimestamp' => now()->getTimestampMs(),
            'requiresDailyAttendance' => $requiresDailyAttendance,
            'hasTeachingSchedule' => $hasTeachingSchedule,
            'isGuruMurni' => $isGuruMurni,
            'isHoliday' => $isHoliday,
            'holidayInfo' => $todayHoliday ? ['name' => $todayHoliday->description, 'date' => $todayHoliday->date] : null,
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
                'batas_terlambat_mengajar' => $teachingLateTolerance,
                'buffer_presensi_masuk' => (int)($settings['buffer_presensi_masuk'] ?? 10),
                'buffer_presensi_keluar' => (int)($settings['buffer_presensi_keluar'] ?? 10),
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
            'hasApprovedDinasLuar' => $onDinasLuar,
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


        // ── Fetch schedule first to check partial dinas luar time overlap ──
        $schedule = TeachingSchedule::findOrFail($request->teaching_schedule_id);
        $hourSlots = TeachingSchedule::hourSlots();
        $slot = $hourSlots[$schedule->hour_number] ?? null;

        $onDinasLuar = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('type', 'izin_dinas_luar')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where(function ($query) use ($slot) {
                $query->where('duration_type', 'full_day')
                    ->orWhere(function ($q) use ($slot) {
                        if ($slot) {
                            $q->where('duration_type', 'partial')
                              ->where('start_time', '<=', $slot['end'])
                              ->where('end_time', '>=', $slot['start']);
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    });
            })
            ->exists();

        // ── Holiday Check ──
        $todayHoliday = Holiday::where('date', $today->toDateString())->first();
        if ($todayHoliday) {
            return back()->withErrors(['message' => "Hari ini adalah Hari Libur ({$todayHoliday->description}). Presensi tidak dapat dilakukan."]);
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

        // ── Check if it's an inval schedule ──
        $isInval = \App\Models\SubstituteTeaching::where('substitute_employee_id', $employee->id)
            ->where('teaching_schedule_id', $request->teaching_schedule_id)
            ->where('date', $today->toDateString())
            ->where('status', 'approved')
            ->exists();
        
        // ── Validation: User must either own the schedule or be an approved substitute ──
        if ($schedule->employee_id !== $employee->id && !$isInval) {
            return back()->withErrors(['message' => 'Anda tidak memiliki hak untuk melakukan presensi pada jadwal ini.']);
        }

        $settings = SystemSetting::pluck('value', 'key');
        $teachingLateTolerance = (int)($settings['teaching_late_tolerance'] ?? 10);

        $status = 'present';

        if (!$onDinasLuar && $slot) {
            // For hour 10 (last hour), open time is slot['end'] (14:40) instead of slot['start'] (14:00)
            $openTimeStr = ($schedule->hour_number == 10) ? $slot['end'] : $slot['start'];
            $openTime = Carbon::createFromFormat('H:i', $openTimeStr);
            $slotDeadline = $openTime->copy()->addMinutes($teachingLateTolerance);

            if ($now->lt($openTime)) {
                return back()->withErrors(['message' => "Belum waktunya jam pelajaran ke-{$schedule->hour_number}. Presensi Jam ke-10 baru dibuka pada pukul " . $openTimeStr]);
            }

            if ($isInval) {
                // Inval teacher is always present, not late and not blocked by deadline
                $status = 'present';
            } elseif ($now->gt($slotDeadline)) {
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
                    return back()->withErrors(['message' => "Batas waktu presensi Jam ke-{$schedule->hour_number} ({$openTimeStr} + {$teachingLateTolerance} menit) telah terlewat. Hubungi Admin Presensi/Kurikulum."]);
                }

                // Mark unlock as used
                $unlock->update(['used' => true]);
                $status = $unlock->is_lateness_violation ? 'late' : 'present';
            } elseif ($now->gt($openTime)) {
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
            'is_dinas_luar' => $onDinasLuar,
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
                'is_dinas_luar' => $onDinasLuar,
            ]
        );
        
        if ($onDinasLuar && !$dailyAtt->is_dinas_luar) {
            $dailyAtt->update(['is_dinas_luar' => true]);
        }

        if ($isInval) {
            $dailyAtt->increment('inval_hours', 1);
        } else {
            $dailyAtt->increment('teaching_hours', 1);
        }

        $statusMsg = $status === 'late' ? 'Presensi Jam ke-' . $schedule->hour_number . ' berhasil (Terlambat).' : 'Presensi Jam ke-' . $schedule->hour_number . ' berhasil!';
        return back()->with('message', $statusMsg);
    }
}
