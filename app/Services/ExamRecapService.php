<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\ExamSupervisionAttendance;
use App\Models\ExamSupervisionSchedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ExamRecapService
{
    public static function getMonthlyRecap(int $month, int $year, string $roleFilter = 'all'): array
    {
        $query = Employee::with(['positions'])->where('status', 'active');
        $employees = $query->get();

        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth();
        if ($endDate->isFuture()) {
            $endDate = Carbon::today();
        }

        $allAttendances = ExamSupervisionAttendance::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('employee_id');

        $recapData = [];
        $totalPresent = 0;
        $totalLate = 0;

        foreach ($employees as $employee) {
            $isGuru = $employee->positions->contains('name', 'Guru');
            $isStaff = $employee->positions->contains('name', 'Staff');
            $positionName = $employee->positions->pluck('name')->implode(', ');

            if ($roleFilter === 'Guru' && !$isGuru) continue;
            if ($roleFilter === 'Staff' && !$isStaff && !$employee->positions->isEmpty()) continue;

            $empAttendances = $allAttendances->get($employee->id, collect());
            
            $presentCount = $empAttendances->where('status', 'present')->count();
            $lateCount = $empAttendances->where('status', 'late')->count();
            
            $recapData[] = [
                'id' => $employee->id,
                'name' => $employee->name,
                'nik' => $employee->nik,
                'position' => $positionName ?: '-',
                'is_guru' => $isGuru,
                'photo_path' => $employee->photo_path,
                'photo_url' => $employee->photo_url,
                'present' => $presentCount,
                'late' => $lateCount,
                'total_attended' => $presentCount + $lateCount,
            ];

            $totalPresent += $presentCount;
            $totalLate += $lateCount;
        }

        usort($recapData, fn($a, $b) => strcmp($a['name'], $b['name']));

        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $monthName = $months[$month];
        $periodLabel = "{$monthName} {$year}";

        return [
            'recapData' => $recapData,
            'totalStats' => [
                'present' => $totalPresent,
                'late' => $totalLate,
            ],
            'monthName' => $monthName,
            'periodLabel' => $periodLabel,
        ];
    }
}
