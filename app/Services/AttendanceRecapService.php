<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\SubstituteTeaching;
use App\Models\SystemSetting;
use App\Models\TeachingAttendance;
use App\Models\TeachingSchedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class AttendanceRecapService
{
    /**
     * Calculate monthly attendance recap for all employees/teachers/staff.
     *
     * @param int $month
     * @param int $year
     * @param string $roleFilter 'all' | 'Guru' | 'Staff'
     * @return array
     */
    public static function getMonthlyRecap(int $month, int $year, string $roleFilter = 'all'): array
    {
        $query = Employee::with(['positions', 'user.roles', 'teachingSchedules.schoolClass'])->where('status', 'active');
        $employees = $query->get();

        if ($roleFilter === 'Guru') {
            $employees = $employees->filter(fn($emp) => $emp->teachingSchedules->isNotEmpty());
        } elseif ($roleFilter === 'Staff') {
            $employees = $employees->filter(fn($emp) => $emp->teachingSchedules->isEmpty());
        }

        $settings = SystemSetting::pluck('value', 'key');
        $cutoffType = $settings['recap_cutoff_type'] ?? 'calendar_month';
        $countHolidays = ($settings['count_holidays_as_present'] ?? $settings['recap_count_holidays'] ?? '0') === '1';

        if ($cutoffType === 'custom_date') {
            $cutoffDay = (int) ($settings['recap_cutoff_day'] ?? 20);
            $endDate = Carbon::create($year, $month, $cutoffDay)->endOfDay();
            $startDate = $endDate->copy()->subMonth()->addDay()->startOfDay();
        } else {
            $startDate = Carbon::create($year, $month, 1)->startOfDay();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth()->endOfDay();
        }

        if ($cutoffType === 'custom_date') {
            $startStr = $startDate->translatedFormat('d F Y');
            $endStr = $endDate->translatedFormat('d F Y');
            $periodLabel = "$startStr s.d. $endStr";
        } else {
            $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            $periodLabel = ($months[$month] ?? '') . ' ' . $year;
        }

        // Get working days & holidays
        $workingDaysDates = [];
        $holidays = Holiday::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $validHolidayCount = 0;
        $todayStr = Carbon::today()->format('Y-m-d');
        $period = CarbonPeriod::create($startDate, $endDate);
        foreach ($period as $date) {
            if ($date->isWeekday()) {
                if (!in_array($date->format('Y-m-d'), $holidays)) {
                    $workingDaysDates[] = $date->format('Y-m-d');
                } else {
                    // Only count holiday if the holiday date has passed or is today
                    if ($date->format('Y-m-d') <= $todayStr) {
                        $validHolidayCount++;
                    }
                }
            }
        }

        $substitutions = SubstituteTeaching::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('status', 'approved')
            ->get()
            ->groupBy(['absent_employee_id', 'date']);

        $substitutionsBySub = SubstituteTeaching::with('teachingSchedule.schoolClass')
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('status', 'approved')
            ->get()
            ->groupBy(['substitute_employee_id', 'date']);

        $recap = [];
        $stats = [
            'present' => 0,
            'late' => 0,
            'permit' => 0,
            'sick' => 0,
            'alpha' => 0,
            'teaching_hours' => 0,
        ];

        foreach ($employees->sortBy('name') as $emp) {
            $attendances = Attendance::where('employee_id', $emp->id)
                ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->get()
                ->keyBy(fn($a) => Carbon::parse($a->date)->format('Y-m-d'));

            $teachingAttendances = TeachingAttendance::where('employee_id', $emp->id)
                ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->get()
                ->groupBy('date');

            $leaves = LeaveRequest::where('employee_id', $emp->id)
                ->where('status', 'approved')
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('start_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                      ->orWhereBetween('end_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                      ->orWhere(function ($sq) use ($startDate, $endDate) {
                          $sq->where('start_date', '<=', $startDate->format('Y-m-d'))
                            ->where('end_date', '>=', $endDate->format('Y-m-d'));
                      });
                })->get();

            $presentCount = 0;
            $lateCount = 0;
            $permitCount = 0;
            $sickCount = 0;
            $alphaCount = 0;
            $teaching_hours = $attendances->sum('teaching_hours') + $attendances->sum('inval_hours');

            $holidayCount = $countHolidays ? $validHolidayCount : 0;

            foreach ($workingDaysDates as $wDate) {
                if ($attendances->has($wDate)) {
                    $att = $attendances->get($wDate);
                    if ($att->status === 'present') $presentCount++;
                    elseif ($att->status === 'late') $lateCount++;
                    elseif ($att->status === 'alpha') $alphaCount++;
                    elseif ($att->status === 'permit') $permitCount++;
                    elseif ($att->status === 'sick') $sickCount++;
                } else {
                    if ($wDate <= $todayStr) {
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
            }

            $hasSchedules = $emp->teachingSchedules->isNotEmpty() || $substitutionsBySub->has($emp->id) || ($emp->teaching_hours && $emp->teaching_hours > 0);
            $jtm_scheduled = 0;
            $jtm_effective = 0;
            $jtm_effective_10 = 0;
            $jtm_effective_11 = 0;
            $jtm_effective_12 = 0;
            $jtm_present = 0;
            $jtm_late = 0;
            $jtm_permit = 0;
            $jtm_sick = 0;
            $jtm_inval = 0;
            $jtm_holiday = 0;
            $jtm_absent = 0;

            if ($hasSchedules) {
                $schedules = $emp->teachingSchedules;
                $weekly_hours = ($emp->teaching_hours && $emp->teaching_hours > 0) ? (int) $emp->teaching_hours : $schedules->count();
                // JTM Terjadwal: Total Jam Mengajar Guru dalam 1 bulan/4 Minggu (contoh: 24 Jam x 4 = 96 Jam)
                $jtm_scheduled = $weekly_hours * 4;

                // Realtime presensi foto (TeachingAttendance)
                $tAttsMonth = TeachingAttendance::with('teachingSchedule.schoolClass')
                    ->where('employee_id', $emp->id)
                    ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->where('status', '!=', 'alpha')
                    ->get();

                // Dapatkan penugasan inval guru ini di bulan tersebut
                $mySubAssignments = SubstituteTeaching::where('substitute_employee_id', $emp->id)
                    ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->where('status', 'approved')
                    ->get();

                $subScheduleDateKeys = [];
                foreach ($mySubAssignments as $sub) {
                    $subScheduleDateKeys[$sub->date . '_' . $sub->teaching_schedule_id] = true;
                }

                $jtm_present_10 = 0;
                $jtm_present_11 = 0;
                $jtm_present_12 = 0;
                $jtm_inval = 0;

                foreach ($tAttsMonth as $tAtt) {
                    $key = $tAtt->date . '_' . $tAtt->teaching_schedule_id;
                    if (isset($subScheduleDateKeys[$key])) {
                        $jtm_inval++;
                    } else {
                        $level = $tAtt->teachingSchedule->schoolClass->level ?? '';
                        if ($level === 'X' || $level === '10') $jtm_present_10++;
                        elseif ($level === 'XI' || $level === '11') $jtm_present_11++;
                        elseif ($level === 'XII' || $level === '12') $jtm_present_12++;
                    }
                }

                $jtm_effective_10 = $jtm_present_10;
                $jtm_effective_11 = $jtm_present_11;
                $jtm_effective_12 = $jtm_present_12;
                $jtm_effective = $jtm_effective_10 + $jtm_effective_11 + $jtm_effective_12;

                // Perhitungan JTM Libur (Hanya dihitung jika tanggal libur sudah terlewati atau hari ini)
                $jtm_holiday = 0;
                foreach ($holidays as $hDate) {
                    if ($hDate <= $todayStr) {
                        $dayOfWeek = Carbon::parse($hDate)->dayOfWeekIso;
                        if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                            $jtm_holiday += $schedules->where('day_of_week', $dayOfWeek)->count();
                        }
                    }
                }

                // Perhitungan JTM Izin & JTM Alpa
                $tAttsByKey = $tAttsMonth->keyBy(fn($a) => $a->date . '_' . $a->teaching_schedule_id);

                $jtm_permit = 0;
                $jtm_absent = 0;
                $todayStr = Carbon::today()->format('Y-m-d');
                $currentTimeStr = Carbon::now()->format('H:i');
                $hourSlots = TeachingSchedule::hourSlots();

                foreach ($workingDaysDates as $wDate) {
                    if (in_array($wDate, $holidays)) continue;

                    $dayOfWeek = Carbon::parse($wDate)->dayOfWeekIso;
                    $schedulesOnDay = $schedules->where('day_of_week', $dayOfWeek);
                    if ($schedulesOnDay->isEmpty()) continue;

                    foreach ($schedulesOnDay as $schedule) {
                        // Cek jika slot ini digantikan oleh guru lain (bursa inval)
                        $subsOnDay = $substitutions->get($emp->id)?->get($wDate) ?? collect();
                        $isSubstituted = $subsOnDay->where('teaching_schedule_id', $schedule->id)->isNotEmpty();

                        if ($isSubstituted) {
                            $jtm_permit++;
                            continue;
                        }

                        // Cek permohonan izin/sakit pegawai
                        $onLeave = false;
                        foreach ($leaves as $leave) {
                            if (Carbon::parse($wDate)->betweenIncluded(Carbon::parse($leave->start_date), Carbon::parse($leave->end_date))) {
                                $onLeave = true;
                                break;
                            }
                        }

                        if ($onLeave) {
                            $jtm_permit++;
                            continue;
                        }

                        // Cek status presensi harian (Izin/Sakit/Dinas Luar)
                        $dailyAtt = $attendances->get($wDate);
                        if ($dailyAtt && (in_array($dailyAtt->status, ['permit', 'sick']) || $dailyAtt->is_dinas_luar)) {
                            $jtm_permit++;
                            continue;
                        }

                        // Cek ketersediaan presensi foto
                        $hasPhoto = $tAttsByKey->has($wDate . '_' . $schedule->id);
                        if (!$hasPhoto) {
                            $isPast = false;
                            if ($wDate < $todayStr) {
                                $isPast = true;
                            } elseif ($wDate === $todayStr) {
                                $slot = $hourSlots[$schedule->hour_number] ?? null;
                                if ($slot && $currentTimeStr > $slot['end']) {
                                    $isPast = true;
                                }
                            }

                            if ($isPast) {
                                $jtm_absent++;
                            }
                        }
                    }
                }

                // Untuk ringkasan statistik utama Guru
                $presentCount = $jtm_effective + $jtm_inval + ($countHolidays ? $jtm_holiday : 0);
                $lateCount = 0;
                $permitCount = $jtm_permit;
                $sickCount = 0;
                $alphaCount = $jtm_absent;
                $holidayCount = 0;
            }

            $recap[] = [
                'id' => $emp->id,
                'name' => $emp->name,
                'nik' => $emp->nik ?? $emp->nip,
                'photo_path' => $emp->photo_path,
                'photo_url' => $emp->photo_url,
                'position' => $emp->positions->where('pivot.is_primary', true)->first()?->name ?? ($emp->positions->first()?->name ?? '-'),
                'position_names' => $emp->positions->pluck('name')->toArray(),
                'is_guru' => $hasSchedules,
                'present' => $presentCount + $holidayCount,
                'late' => $lateCount,
                'permit' => $permitCount,
                'sick' => $sickCount,
                'alpha' => $alphaCount,
                'teaching_hours' => $teaching_hours,
                'jtm_scheduled' => $jtm_scheduled,
                'jtm_effective' => $jtm_effective,
                'jtm_effective_10' => $jtm_effective_10,
                'jtm_effective_11' => $jtm_effective_11,
                'jtm_effective_12' => $jtm_effective_12,
                'jtm_permit' => $jtm_permit,
                'jtm_inval' => $jtm_inval,
                'jtm_holiday' => $jtm_holiday,
                'jtm_absent' => $jtm_absent,
            ];

            $stats['present'] += $presentCount + $holidayCount;
            $stats['late'] += $lateCount;
            $stats['permit'] += $permitCount;
            $stats['sick'] += $sickCount;
            $stats['alpha'] += $alphaCount;
            $stats['teaching_hours'] += $jtm_effective;
        }

        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        return [
            'recapData' => $recap,
            'totalStats' => $stats,
            'monthName' => $months[$month] ?? '',
            'year' => $year,
            'periodLabel' => $periodLabel,
        ];
    }
}
