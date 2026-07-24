<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class MyAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $attendances = collect();
        $stats = ['present' => 0, 'late' => 0, 'permit' => 0, 'sick' => 0, 'alpha' => 0, 'teaching_hours' => 0];

        if ($employee) {
            $existingAttendances = Attendance::where('employee_id', $employee->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get()
                ->keyBy(fn($a) => Carbon::parse($a->date)->format('Y-m-d'));

            $teachingAttendances = \App\Models\TeachingAttendance::where('employee_id', $employee->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', '!=', 'alpha')
                ->get()
                ->groupBy(fn($ta) => Carbon::parse($ta->date)->format('Y-m-d'));

            $leaves = \App\Models\LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->where(function ($q) use ($month, $year) {
                    $q->whereMonth('start_date', $month)->whereYear('start_date', $year)
                      ->orWhereMonth('end_date', $month)->whereYear('end_date', $year);
                })->get();

            $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
            $holidays = \App\Models\Holiday::whereMonth('date', $month)->whereYear('date', $year)->pluck('date')->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))->toArray();

            $fullAttendances = collect();

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = Carbon::create($year, $month, $i);
                $dateStr = $date->format('Y-m-d');

                if ($date->isWeekday() && !in_array($dateStr, $holidays)) {
                    $tCount = isset($teachingAttendances[$dateStr]) ? $teachingAttendances[$dateStr]->count() : 0;
                    if ($existingAttendances->has($dateStr)) {
                        $a = $existingAttendances->get($dateStr);
                        $totalTeaching = max(($a->teaching_hours ?? 0) + ($a->inval_hours ?? 0), $tCount);
                        $fullAttendances->push([
                            'id' => $a->id,
                            'date' => $a->date,
                            'check_in' => $a->check_in,
                            'check_out' => $a->check_out,
                            'status' => $a->status,
                            'teaching_hours' => $totalTeaching,
                            'inval_hours' => $a->inval_hours,
                        ]);
                    } else {
                        // Check leave
                        $onLeave = false;
                        $leaveType = 'alpha';
                        foreach ($leaves as $leave) {
                            if ($date->betweenIncluded(Carbon::parse($leave->start_date), Carbon::parse($leave->end_date))) {
                                $onLeave = true;
                                $leaveType = $leave->type === 'Sakit' ? 'sick' : 'permit';
                                break;
                            }
                        }

                        if (!$date->isFuture()) {
                            $fullAttendances->push([
                                'id' => 'virtual_' . $dateStr,
                                'date' => $dateStr,
                                'check_in' => null,
                                'check_out' => null,
                                'status' => $tCount > 0 ? 'present' : $leaveType,
                                'teaching_hours' => $tCount,
                                'inval_hours' => 0,
                            ]);
                        }
                    }
                }
            }

            // Sort by date desc
            $attendances = $fullAttendances->sortByDesc('date')->values();

            // Synchronize stats directly with AttendanceRecapService (Single Source of Truth)
            $monthlyRecap = \App\Services\AttendanceRecapService::getMonthlyRecap($month, $year);
            $empRecap = collect($monthlyRecap['recapData'])->firstWhere('id', $employee->id);

            if ($empRecap) {
                $stats = [
                    'present' => $empRecap['present'],
                    'late' => $empRecap['late'],
                    'permit' => $empRecap['permit'],
                    'sick' => $empRecap['sick'],
                    'alpha' => $empRecap['alpha'],
                    'teaching_hours' => $empRecap['teaching_hours'],
                    'jtm_scheduled' => $empRecap['jtm_scheduled'] ?? 0,
                    'jtm_effective' => $empRecap['jtm_effective'] ?? 0,
                    'jtm_effective_10' => $empRecap['jtm_effective_10'] ?? 0,
                    'jtm_effective_11' => $empRecap['jtm_effective_11'] ?? 0,
                    'jtm_effective_12' => $empRecap['jtm_effective_12'] ?? 0,
                    'jtm_inval' => $empRecap['jtm_inval'] ?? 0,
                    'jtm_permit' => $empRecap['jtm_permit'] ?? 0,
                    'jtm_holiday' => $empRecap['jtm_holiday'] ?? 0,
                    'jtm_absent' => $empRecap['jtm_absent'] ?? 0,
                ];
            } else {
                $stats = [
                    'present' => $attendances->where('status', 'present')->count(),
                    'late' => $attendances->where('status', 'late')->count(),
                    'permit' => $attendances->where('status', 'permit')->count(),
                    'sick' => $attendances->where('status', 'sick')->count(),
                    'alpha' => $attendances->where('status', 'alpha')->count(),
                    'teaching_hours' => $attendances->sum('teaching_hours'),
                ];
            }
        }

        return Inertia::render('MyAttendance/Index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
            'employee' => $employee ? [
                'name' => $employee->name,
                'position' => $employee->positions->pluck('name')->join(', ') ?: '-',
            ] : null,
        ]);
    }
}
