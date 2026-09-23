<?php

namespace App\Http\Controllers;

use App\Models\ExamSupervisionSchedule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\TeachingSchedule;

class MyExamScheduleController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Smart Switch: If not in exam mode, redirect to regular teaching schedule
        $isExamMode = TeachingSchedule::isExamMode(Carbon::today()->toDateString());
        if (!$isExamMode) {
            return redirect()->route('my-schedule.index');
        }

        if (!$employee) {
            return Inertia::render('MyExamSchedule/Index', [
                'schedules' => [],
                'todaySchedules' => [],
                'sessionSlots' => ExamSupervisionSchedule::sessionSlots(),
                'dayLabels' => TeachingSchedule::dayLabels(),
                'employee' => null,
                'todayDow' => Carbon::now()->dayOfWeekIso,
            ]);
        }

        $schedules = ExamSupervisionSchedule::with('schoolClass')
            ->where('employee_id', $employee->id)
            ->orderBy('day_of_week')
            ->orderBy('session_number')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'day_of_week' => $s->day_of_week,
                'session_number' => $s->session_number,
                'subject' => $s->subject,
                'class_name' => $s->schoolClass->name ?? '-',
                'room_name' => $s->room_name ?? '-',
            ]);

        $todayDow = Carbon::now()->dayOfWeekIso;
        $todaySchedules = $schedules->where('day_of_week', $todayDow)->values();

        return Inertia::render('MyExamSchedule/Index', [
            'schedules' => $schedules,
            'todaySchedules' => $todaySchedules,
            'sessionSlots' => ExamSupervisionSchedule::sessionSlots(),
            'dayLabels' => TeachingSchedule::dayLabels(),
            'employee' => [
                'name' => $employee->name,
                'position' => $employee->positions->pluck('name')->join(', ') ?: '-',
            ],
            'todayDow' => $todayDow,
        ]);
    }
}
