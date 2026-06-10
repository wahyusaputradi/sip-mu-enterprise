<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $payrolls = Payroll::with('employee.positions')
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $summary = [
            'total_employees' => $payrolls->count(),
            'total_net_salary' => $payrolls->sum('net_salary'),
            'total_pending' => $payrolls->where('status', 'pending')->count(),
            'total_paid' => $payrolls->where('status', 'paid')->count(),
        ];

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'summary' => $summary,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year,
            ]
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $this->payrollService->generateMonthlyPayroll($request->month, $request->year);

        return redirect()->route('payroll.index', ['month' => $request->month, 'year' => $request->year])->with('success', 'Payroll berhasil digenerate otomatis.');
    }

    public function edit(Payroll $payroll)
    {
        $payroll->load('employee.positions');
        return Inertia::render('Payroll/Edit', [
            'payroll' => $payroll
        ]);
    }

    public function update(Request $request, Payroll $payroll)
    {
        if ($payroll->status === 'paid') {
            return redirect()->back()->with('error', 'Tidak dapat mengubah data penggajian yang sudah berstatus Paid.');
        }

        $requiresNotes = $request->allowance_other > 0 || $request->deduction_other > 0;

        $request->validate([
            'allowance_other' => 'nullable|numeric|min:0',
            'deduction_other' => 'nullable|numeric|min:0',
            'notes' => $requiresNotes ? 'required|string' : 'nullable|string',
        ]);

        $payroll->update([
            'allowance_other' => $request->allowance_other ?? 0,
            'deduction_other' => $request->deduction_other ?? 0,
            'notes' => $request->notes,
        ]);

        // Recalculate everything after manual update
        $this->payrollService->calculateEmployeePayroll($payroll->employee, $payroll->month, $payroll->year);

        return redirect()->route('payroll.index', ['month' => $payroll->month, 'year' => $payroll->year])->with('success', 'Penyesuaian manual payroll berhasil disimpan.');
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|in:pending,paid',
        ]);

        Payroll::whereIn('id', $request->ids)->update(['status' => $request->status]);

        if ($request->status === 'paid') {
            $payrolls = Payroll::with('employee.user')->whereIn('id', $request->ids)->get();
            foreach ($payrolls as $payroll) {
                if ($payroll->employee && $payroll->employee->user) {
                    $payroll->employee->user->notify(new \App\Notifications\SystemNotification(
                        'Gaji Telah Ditunaikan',
                        "Gaji bulan {$payroll->month}/{$payroll->year} telah ditunaikan. Silakan cek Slip Gaji Anda.",
                        '/my-payslip'
                    ));
                }
            }
        }

        return redirect()->back()->with('success', 'Status payroll berhasil diperbarui.');
    }

    public function show(Payroll $payroll)
    {
        $payroll->load('employee.positions');
        return Inertia::render('Payroll/Show', [
            'payroll' => $payroll
        ]);
    }

    public function downloadSlip(Payroll $payroll)
    {
        $payroll->load('employee.positions');
        $employee = $payroll->employee;
        
        $pdf = Pdf::loadView('pdf.payslip', compact('payroll', 'employee'));
        $filename = 'Slip_Gaji_' . str_replace(' ', '_', $employee->name) . '_' . $payroll->month . '_' . $payroll->year . '.pdf';
        return $pdf->download($filename);
    }

    private function getIslamicMessage($employee, $payroll)
    {
        \Carbon\Carbon::setLocale('id');
        $monthName = \Carbon\Carbon::createFromFormat('m', $payroll->month)->translatedFormat('F');
        $periode = $monthName . ' ' . $payroll->year;

        $message = "Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n";
        $message .= "Yth. Bapak/Ibu *{$employee->name}*,\n\n";
        $message .= "Semoga senantiasa dalam lindungan Allah SWT.\n\n";
        $message .= "Bersama pesan ini, kami informasikan bahwa Slip Gaji periode *{$periode}* telah diterbitkan.\n";
        $message .= "Adapun Gaji Bersih (Take Home Pay) Anda adalah sebesar: *Rp " . number_format($payroll->net_salary, 0, ',', '.') . "*.\n\n";
        $message .= "Untuk rincian lengkapnya dapat Bapak/Ibu cek melalui aplikasi SIP-MU Enterprise.\n\n";
        $message .= "Terima kasih atas dedikasi dan kinerja Bapak/Ibu.\n\n";
        $message .= "Wassalamu'alaikum Warahmatullahi Wabarakatuh.\n\n";
        $message .= "Bendahara - SMK Manbaul Ulum";

        return $message;
    }

    private function sendFonnte($phone, $message)
    {
        $fonnteToken = env('FONNTE_TOKEN');
        if (!$fonnteToken) {
            return ['status' => false, 'reason' => 'Token Fonnte belum dikonfigurasi di .env'];
        }

        // Sanitasi nomor HP (hilangkan karakter selain angka)
        $phone = preg_replace('/[^0-9]/', '', $phone);
        // Pastikan format diawali 08 (untuk standar Indonesia di Fonnte lebih stabil)
        if (substr($phone, 0, 2) == '62') {
            $phone = '0' . substr($phone, 2);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $fonnteToken,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $message,
            ]);

            $data = $response->json();
            
            if (isset($data['status']) && $data['status'] == true) {
                return ['status' => true, 'reason' => ''];
            }
            
            return ['status' => false, 'reason' => $data['reason'] ?? 'Gagal mengirim, respon API tidak dikenali.'];
        } catch (\Exception $e) {
            return ['status' => false, 'reason' => 'Koneksi ke API Fonnte gagal: ' . $e->getMessage()];
        }
    }

    public function sendWhatsApp(Payroll $payroll)
    {
        $payroll->load('employee');
        $employee = $payroll->employee;
        
        if (!$employee->phone) {
            return redirect()->back()->with('error', 'Nomor WhatsApp tidak ditemukan.');
        }

        $message = $this->getIslamicMessage($employee, $payroll);

        if (env('FONNTE_TOKEN')) {
            $result = $this->sendFonnte($employee->phone, $message);
            if ($result['status']) {
                return redirect()->back()->with('success', 'Pesan WhatsApp berhasil dikirim otomatis via Fonnte.');
            }
            return redirect()->back()->with('error', 'Gagal mengirim pesan WhatsApp: ' . $result['reason']);
        }

        // Fallback manual wa.me jika token tidak ada
        $url = "https://wa.me/{$employee->phone}?text=" . urlencode($message);
        return Inertia::location($url);
    }

    public function sendBulkWhatsApp(Request $request)
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
        ]);

        if (!env('FONNTE_TOKEN')) {
            return redirect()->back()->with('error', 'Token Fonnte belum dikonfigurasi di file .env. Pengiriman massal dibatalkan.');
        }

        $payrolls = Payroll::with('employee')->where('month', $request->month)
            ->where('year', $request->year)
            ->where('status', 'paid')
            ->get();

        if ($payrolls->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada data gaji dengan status PAID pada periode tersebut.');
        }

        $countSuccess = 0;
        $countFailed = 0;
        foreach ($payrolls as $payroll) {
            if ($payroll->employee && $payroll->employee->phone) {
                $message = $this->getIslamicMessage($payroll->employee, $payroll);
                $result = $this->sendFonnte($payroll->employee->phone, $message);
                if ($result['status']) {
                    $countSuccess++;
                } else {
                    $countFailed++;
                }
            }
        }

        $msg = "Berhasil mengirim ke {$countSuccess} pegawai.";
        if ($countFailed > 0) {
            $msg .= " Namun, gagal mengirim ke {$countFailed} pegawai (cek Token Fonnte/Nomor HP).";
            return redirect()->back()->with('error', $msg);
        }

        return redirect()->back()->with('success', $msg);
    }
}
