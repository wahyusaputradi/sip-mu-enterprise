<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class MyPayslipController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        $year = $request->input('year', Carbon::now()->year);

        $payslips = collect();

        if ($employee) {
            $payslips = Payroll::where('employee_id', $employee->id)
                ->where('year', $year)
                ->orderBy('month', 'desc')
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'month' => $p->month,
                    'year' => $p->year,
                    'gross_salary' => $p->gross_salary,
                    'allowance_other' => $p->allowance_other,
                    'total_deductions' => $p->total_deductions,
                    'net_salary' => $p->net_salary,
                    'status' => $p->status,
                ]);
        }

        return Inertia::render('MyPayslip/Index', [
            'payslips' => $payslips,
            'filters' => [
                'year' => (int) $year,
            ],
            'employee' => $employee ? [
                'name' => $employee->name,
                'position' => $employee->positions->pluck('name')->join(', ') ?: '-',
            ] : null,
        ]);
    }

    /**
     * Show detail of a specific payslip (personal, with authorization).
     */
    public function show(Payroll $payroll)
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Authorization: only allow viewing own payslip
        if (!$employee || $payroll->employee_id !== $employee->id) {
            abort(403, 'Anda tidak memiliki akses ke slip gaji ini.');
        }

        $payroll->load('employee.positions');
        return Inertia::render('MyPayslip/Show', [
            'payroll' => $payroll,
        ]);
    }

    /**
     * Download PDF of a specific payslip (personal, with authorization).
     */
    public function downloadSlip(Payroll $payroll)
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Authorization: only allow downloading own payslip
        if (!$employee || $payroll->employee_id !== $employee->id) {
            abort(403, 'Anda tidak memiliki akses ke slip gaji ini.');
        }

        $payroll->load('employee.positions');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payslip', compact('payroll', 'employee'));
        $filename = 'Slip_Gaji_' . str_replace(' ', '_', $employee->name) . '_' . $payroll->month . '_' . $payroll->year . '.pdf';
        return $pdf->download($filename);
    }
}
