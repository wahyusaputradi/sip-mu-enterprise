<?php

namespace App\Http\Controllers;

use App\Models\TeachingSchedule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class MyScheduleController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return Inertia::render('MySchedule/Index', [
                'schedules' => [],
                'todaySchedules' => [],
                'hourSlots' => TeachingSchedule::hourSlots(),
                'dayLabels' => TeachingSchedule::dayLabels(),
                'employee' => null,
                'todayDow' => Carbon::now()->dayOfWeekIso,
            ]);
        }

        $schedules = TeachingSchedule::with('schoolClass')
            ->where('employee_id', $employee->id)
            ->orderBy('day_of_week')
            ->orderBy('hour_number')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'day_of_week' => $s->day_of_week,
                'hour_number' => $s->hour_number,
                'subject' => $s->subject,
                'class_name' => $s->schoolClass->name ?? '-',
            ]);

        $todayDow = Carbon::now()->dayOfWeekIso;
        $todaySchedules = $schedules->where('day_of_week', $todayDow)->values();

        return Inertia::render('MySchedule/Index', [
            'schedules' => $schedules,
            'todaySchedules' => $todaySchedules,
            'hourSlots' => TeachingSchedule::hourSlots(),
            'dayLabels' => TeachingSchedule::dayLabels(),
            'employee' => [
                'name' => $employee->name,
                'position' => $employee->positions->pluck('name')->join(', ') ?: '-',
            ],
            'todayDow' => $todayDow,
        ]);
    }
}
