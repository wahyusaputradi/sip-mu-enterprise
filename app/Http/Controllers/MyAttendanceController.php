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
                    if ($existingAttendances->has($dateStr)) {
                        $a = $existingAttendances->get($dateStr);
                        $fullAttendances->push([
                            'id' => $a->id,
                            'date' => $a->date,
                            'check_in' => $a->check_in,
                            'check_out' => $a->check_out,
                            'status' => $a->status,
                            'teaching_hours' => $a->teaching_hours,
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
                                'status' => $leaveType,
                                'teaching_hours' => 0,
                                'inval_hours' => 0,
                            ]);
                        }
                    }
                }
            }

            // Sort by date desc
            $attendances = $fullAttendances->sortByDesc('date')->values();

            $stats = [
                'present' => $attendances->where('status', 'present')->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'permit' => $attendances->where('status', 'permit')->count(),
                'sick' => $attendances->where('status', 'sick')->count(),
                'alpha' => $attendances->where('status', 'alpha')->count(),
                'teaching_hours' => $attendances->sum('teaching_hours'),
            ];
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
