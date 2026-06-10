<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Position;
use App\Models\Employee;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SalarySettingsGlobalExport;
use App\Imports\SalarySettingsGlobalImport;
use App\Exports\SalarySettingsPositionExport;
use App\Imports\SalarySettingsPositionImport;
use App\Exports\SalarySettingsEmployeeExport;
use App\Imports\SalarySettingsEmployeeImport;

class SalarySettingController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $suffix = "_{$month}_{$year}";

        // 1. Get Global Settings
        $globalKeys = [
            'allowance_homeroom', 'allowance_ekskul_osis', 'allowance_ekskul_polsis',
            'allowance_ekskul_pramuka', 'allowance_ekskul_seni', 'allowance_ekskul_paskibra',
            'allowance_ekskul_rohis', 'base_salary_per_hour', 'substitute_allowance_per_hour',
            'absence_deduction_per_hour'
        ];

        $globalSettings = [];
        foreach ($globalKeys as $key) {
            $override = SystemSetting::where('key', $key . $suffix)->value('value');
            $master = SystemSetting::where('key', $key)->value('value') ?? 0;
            $globalSettings[$key] = $override !== null ? $override : $master;
        }

        // 2. Get Positions
        $positions = Position::withCount('employees')->orderBy('name', 'asc')->get()->map(function($pos) use ($suffix) {
            $overrideJabatan = SystemSetting::where('key', "pos_{$pos->id}_allowance_jabatan{$suffix}")->value('value');
            $overrideTransport = SystemSetting::where('key', "pos_{$pos->id}_allowance_transport{$suffix}")->value('value');
            
            $pos->allowance_jabatan = $overrideJabatan !== null ? $overrideJabatan : $pos->allowance_jabatan;
            $pos->allowance_transport = $overrideTransport !== null ? $overrideTransport : $pos->allowance_transport;
            return $pos;
        });

        // 3. Get Employees with their deductions
        $employees = Employee::with('positions')->orderBy('name', 'asc')->get()->map(function($emp) use ($suffix) {
            $keys = ['bpjs_deduction', 'cooperative_deduction', 'school_loan', 'bmt_loan'];
            foreach ($keys as $k) {
                $override = SystemSetting::where('key', "emp_{$emp->id}_{$k}{$suffix}")->value('value');
                if ($override !== null) {
                    $emp->{$k} = $override;
                }
            }
            return $emp;
        });

        // 4. Get Payroll Period Dates
        $cutoffStartOverride = SystemSetting::where('key', 'payroll_cutoff_start_date' . $suffix)->value('value');
        $cutoffStartMaster = SystemSetting::where('key', 'payroll_cutoff_start_date')->value('value') ?? 26;
        $payrollCutoffStartDate = $cutoffStartOverride !== null ? $cutoffStartOverride : $cutoffStartMaster;

        $cutoffEndOverride = SystemSetting::where('key', 'payroll_cutoff_end_date' . $suffix)->value('value');
        $cutoffEndMaster = SystemSetting::where('key', 'payroll_cutoff_end_date')->value('value') ?? 25;
        $payrollCutoffEndDate = $cutoffEndOverride !== null ? $cutoffEndOverride : $cutoffEndMaster;

        $paydayDateOverride = SystemSetting::where('key', 'payroll_payday_date' . $suffix)->value('value');
        $paydayDateMaster = SystemSetting::where('key', 'payroll_payday_date')->value('value') ?? 1;
        $payrollPaydayDate = $paydayDateOverride !== null ? $paydayDateOverride : $paydayDateMaster;

        return Inertia::render('SalarySettings/Index', [
            'globalSettings' => $globalSettings,
            'positions' => $positions,
            'employees' => $employees,
            'payrollCutoffStartDate' => (int)$payrollCutoffStartDate,
            'payrollCutoffEndDate' => (int)$payrollCutoffEndDate,
            'payrollPaydayDate' => (int)$payrollPaydayDate,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year,
            ]
        ]);
    }

    public function updateGlobal(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'allowance_homeroom' => 'nullable|numeric|min:0',
            'allowance_ekskul_osis' => 'nullable|numeric|min:0',
            'allowance_ekskul_polsis' => 'nullable|numeric|min:0',
            'allowance_ekskul_pramuka' => 'nullable|numeric|min:0',
            'allowance_ekskul_seni' => 'nullable|numeric|min:0',
            'allowance_ekskul_paskibra' => 'nullable|numeric|min:0',
            'allowance_ekskul_rohis' => 'nullable|numeric|min:0',
            'base_salary_per_hour' => 'nullable|numeric|min:0',
            'substitute_allowance_per_hour' => 'nullable|numeric|min:0',
            'absence_deduction_per_hour' => 'nullable|numeric|min:0',
        ]);

        $suffix = "_{$request->month}_{$request->year}";

        $keys = [
            'allowance_homeroom', 'allowance_ekskul_osis', 'allowance_ekskul_polsis',
            'allowance_ekskul_pramuka', 'allowance_ekskul_seni', 'allowance_ekskul_paskibra',
            'allowance_ekskul_rohis', 'base_salary_per_hour', 'substitute_allowance_per_hour',
            'absence_deduction_per_hour'
        ];

        foreach ($keys as $key) {
            $val = $request->$key ?? 0;
            SystemSetting::updateOrCreate(['key' => $key . $suffix], ['value' => $val]);
            
            // Also update the master if it's the current or future month, or just optionally?
            // Actually, to keep it simple, we don't update master here, we only update the month override.
            // But if the user expects this to be the new default, maybe we update master if no override exists?
            // Let's just update the master as well to be safe, so future months inherit it if not overridden.
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        return back()->with('message', "Pengaturan global bulan {$request->month}/{$request->year} berhasil diperbarui.");
    }

    public function updatePosition(Request $request, Position $position)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'allowance_jabatan' => 'nullable|numeric|min:0',
            'allowance_transport' => 'nullable|numeric|min:0',
        ]);

        $suffix = "_{$request->month}_{$request->year}";

        $allowance_jabatan = $request->allowance_jabatan ?? 0;
        $allowance_transport = $request->allowance_transport ?? 0;

        SystemSetting::updateOrCreate(['key' => "pos_{$position->id}_allowance_jabatan{$suffix}"], ['value' => $allowance_jabatan]);
        SystemSetting::updateOrCreate(['key' => "pos_{$position->id}_allowance_transport{$suffix}"], ['value' => $allowance_transport]);

        // Update master
        $position->update([
            'allowance_jabatan' => $allowance_jabatan,
            'allowance_transport' => $allowance_transport,
        ]);

        return back()->with('message', "Parameter finansial untuk jabatan {$position->name} bulan {$request->month}/{$request->year} berhasil diperbarui.");
    }

    public function updateEmployee(Request $request, Employee $employee)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'bpjs_deduction' => 'nullable|numeric|min:0',
            'cooperative_deduction' => 'nullable|numeric|min:0',
            'school_loan' => 'nullable|numeric|min:0',
            'bmt_loan' => 'nullable|numeric|min:0',
        ]);

        $suffix = "_{$request->month}_{$request->year}";

        $keys = ['bpjs_deduction', 'cooperative_deduction', 'school_loan', 'bmt_loan'];
        foreach ($keys as $k) {
            $val = $request->$k ?? 0;
            SystemSetting::updateOrCreate(['key' => "emp_{$employee->id}_{$k}{$suffix}"], ['value' => $val]);
        }

        // Update master
        $employee->update([
            'bpjs_deduction' => $request->bpjs_deduction ?? 0,
            'cooperative_deduction' => $request->cooperative_deduction ?? 0,
            'school_loan' => $request->school_loan ?? 0,
            'bmt_loan' => $request->bmt_loan ?? 0,
        ]);

        return back()->with('message', "Potongan untuk {$employee->name} bulan {$request->month}/{$request->year} berhasil diperbarui.");
    }

    public function updatePayrollDates(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'payroll_payday_date' => 'required|integer|min:1|max:31',
        ]);

        $suffix = "_{$request->month}_{$request->year}";

        SystemSetting::updateOrCreate(
            ['key' => 'payroll_payday_date' . $suffix],
            ['value' => $request->payroll_payday_date]
        );

        // Update master as well
        SystemSetting::updateOrCreate(
            ['key' => 'payroll_payday_date'],
            ['value' => $request->payroll_payday_date]
        );

        return back()->with('message', "Tanggal Payday bulan {$request->month}/{$request->year} berhasil diperbarui.");
    }

    public function updateCutoffDate(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'payroll_cutoff_start_date' => 'required|integer|min:1|max:31',
            'payroll_cutoff_end_date' => 'required|integer|min:1|max:31',
        ]);

        $suffix = "_{$request->month}_{$request->year}";

        SystemSetting::updateOrCreate(
            ['key' => 'payroll_cutoff_start_date' . $suffix],
            ['value' => $request->payroll_cutoff_start_date]
        );
        SystemSetting::updateOrCreate(
            ['key' => 'payroll_cutoff_end_date' . $suffix],
            ['value' => $request->payroll_cutoff_end_date]
        );

        // Update master as well
        SystemSetting::updateOrCreate(
            ['key' => 'payroll_cutoff_start_date'],
            ['value' => $request->payroll_cutoff_start_date]
        );
        SystemSetting::updateOrCreate(
            ['key' => 'payroll_cutoff_end_date'],
            ['value' => $request->payroll_cutoff_end_date]
        );

        return back()->with('message', "Jadwal Cut-off Presensi bulan {$request->month}/{$request->year} berhasil diperbarui.");
    }

    public function exportGlobal(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        return Excel::download(new SalarySettingsGlobalExport($month, $year), "Global_Settings_{$month}_{$year}.xlsx");
    }

    public function templateGlobal()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;
        return Excel::download(new SalarySettingsGlobalExport($month, $year, true), "Template_Global_Settings.xlsx");
    }

    public function importGlobal(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'file' => 'required|mimes:xlsx,xls',
        ]);
        Excel::import(new SalarySettingsGlobalImport($request->month, $request->year), $request->file('file'));
        return back()->with('message', 'Data Global Settings berhasil diimpor.');
    }

    public function exportPositions(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        return Excel::download(new SalarySettingsPositionExport($month, $year), "Tunjangan_Jabatan_{$month}_{$year}.xlsx");
    }

    public function templatePositions()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;
        return Excel::download(new SalarySettingsPositionExport($month, $year, true), "Template_Tunjangan_Jabatan.xlsx");
    }

    public function importPositions(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'file' => 'required|mimes:xlsx,xls',
        ]);
        Excel::import(new SalarySettingsPositionImport($request->month, $request->year), $request->file('file'));
        return back()->with('message', 'Data Tunjangan Jabatan berhasil diimpor.');
    }

    public function exportEmployees(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        return Excel::download(new SalarySettingsEmployeeExport($month, $year), "Potongan_Pegawai_{$month}_{$year}.xlsx");
    }

    public function templateEmployees()
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;
        return Excel::download(new SalarySettingsEmployeeExport($month, $year, true), "Template_Potongan_Pegawai.xlsx");
    }

    public function importEmployees(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
            'file' => 'required|mimes:xlsx,xls',
        ]);
        Excel::import(new SalarySettingsEmployeeImport($request->month, $request->year), $request->file('file'));
        return back()->with('message', 'Data Potongan Pegawai berhasil diimpor.');
    }
}
