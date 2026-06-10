<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;
use Carbon\Carbon;

class PayrollService
{
    public function generateMonthlyPayroll($month, $year)
    {
        $employees = Employee::where('status', 'active')->get();
        $results = [];
        foreach ($employees as $employee) {
            $results[] = $this->calculateEmployeePayroll($employee, $month, $year);
        }
        return $results;
    }

    public function calculateEmployeePayroll(Employee $employee, $month, $year)
    {
        $position = $employee->primaryPosition();
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->filter(function($att) {
                $dayOfWeek = Carbon::parse($att->date)->dayOfWeek;
                return $dayOfWeek !== Carbon::SATURDAY && $dayOfWeek !== Carbon::SUNDAY;
            });

        $suffix = "_{$month}_{$year}";
        $settings = \App\Models\SystemSetting::pluck('value', 'key');

        // A. Check existing payroll for manual overrides
        $existingPayroll = Payroll::where('employee_id', $employee->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        $manualAllowanceOther = $existingPayroll->allowance_other ?? 0;
        $manualDeductionOther = $existingPayroll->deduction_other ?? 0;
        $notes = $existingPayroll->notes ?? null;

        // B. Basic Earnings
        $totalTeachingHours = $attendances->where('status', '!=', 'alpha')->sum('teaching_hours');
        $baseSalary = $settings["base_salary_per_hour{$suffix}"] ?? $settings['base_salary_per_hour'] ?? 0;
        $basicSalaryTotal = $totalTeachingHours * (float)$baseSalary;
        
        $invalHoursManual = $attendances->where('status', '!=', 'alpha')->sum('inval_hours');
        $invalHoursSystem = \App\Models\SubstituteTeaching::where('substitute_employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->count();
        $invalHours = $invalHoursManual + $invalHoursSystem;
        
        $substituteAllowance = $settings["substitute_allowance_per_hour{$suffix}"] ?? $settings['substitute_allowance_per_hour'] ?? 0;
        $invalInsentif = $invalHours * (float)$substituteAllowance;

        // C. Komponen Tunjangan (Allowances)
        $posId = $position ? $position->id : 0;
        $allowanceJabatan = $position ? ($settings["pos_{$posId}_allowance_jabatan{$suffix}"] ?? $position->allowance_jabatan ?? 0) : 0;
        $allowanceTransport = $position ? ($settings["pos_{$posId}_allowance_transport{$suffix}"] ?? $position->allowance_transport ?? 0) : 0;
        
        $homeroomAllowance = $settings["allowance_homeroom{$suffix}"] ?? $settings['allowance_homeroom'] ?? 0;
        $allowanceHomeroom = $employee->is_homeroom_teacher ? (float)$homeroomAllowance : 0;
        
        // Tunjangan Ekskul Spesifik
        $allowanceExtracurricular = 0;
        if ($employee->is_extracurricular_builder) {
            $rates = [
                'OSIS' => (float)($settings["allowance_ekskul_osis{$suffix}"] ?? $settings['allowance_ekskul_osis'] ?? 0),
                'Polsis' => (float)($settings["allowance_ekskul_polsis{$suffix}"] ?? $settings['allowance_ekskul_polsis'] ?? 0),
                'Pramuka' => (float)($settings["allowance_ekskul_pramuka{$suffix}"] ?? $settings['allowance_ekskul_pramuka'] ?? 0),
                'Paskibra' => (float)($settings["allowance_ekskul_paskibra{$suffix}"] ?? $settings['allowance_ekskul_paskibra'] ?? 0),
                'Rohis' => (float)($settings["allowance_ekskul_rohis{$suffix}"] ?? $settings['allowance_ekskul_rohis'] ?? 0),
                'Seni & Bahasa' => (float)($settings["allowance_ekskul_seni{$suffix}"] ?? $settings['allowance_ekskul_seni'] ?? 0),
            ];
            $allowanceExtracurricular = $rates[$employee->extracurricular_name] ?? 0;
        }

        $fixedSalarySettingsAllowance = $employee->salarySettings()->where('type', 'allowance')->sum('amount');

        // D. Komponen Potongan (Deductions)
        $missedHoursSystem = \App\Models\SubstituteTeaching::where('absent_employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->count();
            
        $alphaDays = $attendances->where('status', 'alpha')->count();
        $alphaRate = $settings["absence_deduction_per_hour{$suffix}"] ?? $settings['absence_deduction_per_hour'] ?? 0;
        
        // Potongan absensi = (Hari alpha * Tarif) + (Jam yang di-inval orang lain * Tarif per jam)
        $alphaDeduction = ($alphaDays * (float)$alphaRate) + ($missedHoursSystem * (float)$alphaRate);
        
        $bpjsDeduction = $settings["emp_{$employee->id}_bpjs_deduction{$suffix}"] ?? $employee->bpjs_deduction ?? 0;
        $schoolLoan = $settings["emp_{$employee->id}_school_loan{$suffix}"] ?? $employee->school_loan ?? 0;
        $bmtLoan = $settings["emp_{$employee->id}_bmt_loan{$suffix}"] ?? $employee->bmt_loan ?? 0;
        $cooperativeDeduction = $settings["emp_{$employee->id}_cooperative_deduction{$suffix}"] ?? $employee->cooperative_deduction ?? 0;
        
        $fixedSalarySettingsDeduction = $employee->salarySettings()->where('type', 'deduction')->sum('amount');

        // E. Hasil Kalkulasi Akhir
        $grossPay = $basicSalaryTotal + $invalInsentif + (float)$allowanceJabatan + (float)$allowanceTransport + $allowanceHomeroom + $allowanceExtracurricular + $fixedSalarySettingsAllowance + (float)$manualAllowanceOther;
        $totalDeductions = $alphaDeduction + (float)$bpjsDeduction + (float)$schoolLoan + (float)$bmtLoan + (float)$cooperativeDeduction + $fixedSalarySettingsDeduction + (float)$manualDeductionOther;
        $netSalary = $grossPay - $totalDeductions;

        $holidaysCount = \App\Models\Holiday::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->filter(function($hol) {
                $dayOfWeek = Carbon::parse($hol->date)->dayOfWeek;
                return $dayOfWeek !== Carbon::SATURDAY && $dayOfWeek !== Carbon::SUNDAY;
            })->count();

        $presentDays = $attendances->where('status', 'present')->count() + $holidaysCount;

        $details = [
            'metadata' => [
                'teaching_hours' => $totalTeachingHours,
                'inval_hours' => $invalHours,
                'alpha_days' => $alphaDays,
                'present_days' => $presentDays,
                'holiday_days' => $holidaysCount,
                'extracurricular' => $employee->extracurricular_name,
            ],
            'earnings' => [
                'base' => $basicSalaryTotal,
                'inval' => $invalInsentif,
                'jabatan' => (float)$allowanceJabatan,
                'transport' => (float)$allowanceTransport,
                'homeroom' => $allowanceHomeroom,
                'ekskul' => $allowanceExtracurricular,
                'fixed_settings' => $fixedSalarySettingsAllowance,
                'manual_other' => (float)$manualAllowanceOther,
            ],
            'deductions' => [
                'alpha' => $alphaDeduction,
                'bpjs' => (float)$bpjsDeduction,
                'school_loan' => (float)$schoolLoan,
                'bmt_loan' => (float)$bmtLoan,
                'cooperative' => (float)$cooperativeDeduction,
                'fixed_settings' => $fixedSalarySettingsDeduction,
                'manual_other' => (float)$manualDeductionOther,
            ]
        ];

        return Payroll::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'month' => $month,
                'year' => $year,
            ],
            [
                'gross_salary' => $grossPay,
                'allowance_other' => (float)$manualAllowanceOther,
                'total_deductions' => $totalDeductions,
                'deduction_other' => (float)$manualDeductionOther,
                'net_salary' => $netSalary,
                'details' => $details,
                'status' => $existingPayroll ? $existingPayroll->status : 'pending',
                'notes' => $notes,
            ]
        );
    }
}

