<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $employee->name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 2.5cm 2cm;
        }
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 14px; 
            line-height: 1.5; 
            color: #1e293b; /* slate-800 */
        }
        .container { 
            width: 100%; 
            padding: 0px; 
        }
        /* Kop Surat */
        .kop-surat {
            text-align: center;
            border-bottom: 3px solid #0f172a; /* slate-900 */
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .kop-surat img {
            width: 100%;
            max-width: 700px;
            height: auto;
        }
        /* Judul */
        .judul-container {
            text-align: center;
            margin-bottom: 30px;
        }
        .judul-utama {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
        }
        .judul-sub {
            font-size: 14px;
            font-weight: bold;
            margin: 3px 0 0;
            color: #334155;
        }
        .judul-tahun {
            font-size: 13px;
            margin: 3px 0 0;
            color: #64748b;
        }
        
        /* Info Karyawan */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .info-table td {
            padding: 4px 8px;
            vertical-align: top;
        }
        .info-label {
            width: 20%;
            font-weight: bold;
            color: #475569;
        }
        .info-separator {
            width: 2%;
            text-align: center;
        }
        .info-value {
            width: 78%;
            font-weight: bold;
            color: #0f172a;
        }
        
        /* Tabel Rincian */
        .rincian-title {
            font-weight: bold;
            font-size: 14px;
            color: #0f172a;
            margin-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
        }
        .rincian-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .rincian-table th {
            background-color: #f1f5f9;
            color: #334155;
            padding: 10px 12px;
            text-align: left;
            border: 1px solid #cbd5e1;
            font-size: 13px;
            text-transform: uppercase;
        }
        .rincian-table td {
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            color: #334155;
        }
        .rincian-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-right { text-align: right !important; }
        .font-bold { font-weight: bold !important; }
        
        .subtotal-row td {
            background-color: #e2e8f0;
            font-weight: bold;
            color: #0f172a;
        }
        
        /* Take Home Pay */
        .thp-container {
            margin-top: 25px;
            margin-bottom: 40px;
            padding: 15px;
            border: 2px solid #0f172a;
            background-color: #f8fafc;
            border-radius: 4px;
        }
        .thp-label {
            font-size: 14px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
        }
        .thp-value {
            float: right;
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }

        /* Tanda Tangan */
        .ttd-container {
            width: 100%;
            display: table;
            margin-top: 40px;
        }
        .ttd-kiri {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: bottom;
        }
        .ttd-kanan {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: bottom;
        }
        .titimangsa {
            margin-bottom: 25px;
            color: #334155;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 100px;
            color: #0f172a;
        }
        
        /* Footer note */
        .system-note {
            margin-top: 60px;
            font-size: 10px;
            color: #94a3b8;
            font-style: italic;
            text-align: left;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    @php
        $month = (int) $payroll->month;
        $year = (int) $payroll->year;
        if ($month >= 7) {
            $tahunPelajaran = $year . '/' . ($year + 1);
        } else {
            $tahunPelajaran = ($year - 1) . '/' . $year;
        }
        
        \Carbon\Carbon::setLocale('id');
        $monthName = \Carbon\Carbon::createFromFormat('m', $month)->translatedFormat('F');
        $periode = $monthName . ' ' . $year;
        $titimangsaDate = \Carbon\Carbon::now()->translatedFormat('d F Y');
    @endphp

    <div class="container">
        <!-- Kop Surat -->
        <div class="kop-surat">
            <img src="{{ public_path('images/kop_surat.png') }}" alt="Kop Surat SMK Manbaul Ulum">
        </div>

        <!-- Judul -->
        <div class="judul-container">
            <h1 class="judul-utama">Slip Penerimaan Gaji</h1>
            <p class="judul-sub">Tenaga Pendidik dan Kependidikan SMK Manbaul Ulum</p>
            <p class="judul-tahun">Tahun Pelajaran {{ $tahunPelajaran }}</p>
        </div>

        <!-- Info Pegawai -->
        <table class="info-table">
            <tr>
                <td class="info-label">Periode</td>
                <td class="info-separator">:</td>
                <td class="info-value">{{ $periode }}</td>
            </tr>
            <tr>
                <td class="info-label">Nama Karyawan</td>
                <td class="info-separator">:</td>
                <td class="info-value">{{ $employee->name }}</td>
            </tr>
            <tr>
                <td class="info-label">Jabatan</td>
                <td class="info-separator">:</td>
                <td class="info-value">{{ $employee->positions->pluck('name')->join(', ') ?: '-' }}</td>
            </tr>
            <tr>
                <td class="info-label">ID Pegawai</td>
                <td class="info-separator">:</td>
                <td class="info-value">{{ $employee->nik }} {{ $employee->nuptk ? ' / ' . $employee->nuptk : '' }}</td>
            </tr>
        </table>

        <!-- Komponen Pendapatan -->
        <div class="rincian-title">KOMPONEN PENDAPATAN</div>
        <table class="rincian-table">
            <tr>
                <th width="70%">Keterangan</th>
                <th width="30%" class="text-right">Nominal</th>
            </tr>
            <tr>
                <td>Gaji Pokok ({{ $payroll->details['metadata']['teaching_hours'] ?? 0 }} Jam)</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['base'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @if(($payroll->details['earnings']['inval'] ?? 0) > 0)
            <tr>
                <td>Insentif Jam Ganti / Inval ({{ $payroll->details['metadata']['inval_hours'] ?? 0 }} Jam)</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['inval'], 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr>
                <td>Tunjangan Jabatan</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['jabatan'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Tunjangan Transportasi</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['transport'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @if(($payroll->details['earnings']['homeroom'] ?? 0) > 0)
            <tr>
                <td>Tunjangan Wali Kelas</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['homeroom'], 0, ',', '.') }}</td>
            </tr>
            @endif
            @if(($payroll->details['earnings']['ekskul'] ?? 0) > 0)
            <tr>
                <td>Tunjangan Pembina Ekskul ({{ $payroll->details['metadata']['extracurricular'] ?? 'Ekskul' }})</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['ekskul'], 0, ',', '.') }}</td>
            </tr>
            @endif
            @if(($payroll->details['earnings']['fixed_settings'] ?? 0) > 0)
            <tr>
                <td>Tunjangan Lainnya (Sistem)</td>
                <td class="text-right">Rp {{ number_format($payroll->details['earnings']['fixed_settings'], 0, ',', '.') }}</td>
            </tr>
            @endif
            @if(($payroll->allowance_other ?? 0) > 0 || ($payroll->details['earnings']['manual_other'] ?? 0) > 0)
            <tr>
                <td>Tunjangan Manual (Bonus)</td>
                <td class="text-right">Rp {{ number_format($payroll->allowance_other ?? $payroll->details['earnings']['manual_other'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr class="subtotal-row">
                <td>TOTAL PENDAPATAN</td>
                <td class="text-right">Rp {{ number_format($payroll->gross_salary, 0, ',', '.') }}</td>
            </tr>
        </table>

        <!-- Komponen Potongan -->
        <div class="rincian-title">KOMPONEN POTONGAN</div>
        <table class="rincian-table">
            <tr>
                <th width="70%">Keterangan</th>
                <th width="30%" class="text-right">Nominal</th>
            </tr>
            <tr>
                <td>Potongan Absensi / Alpha ({{ $payroll->details['metadata']['alpha_days'] ?? 0 }} Hari)</td>
                <td class="text-right">Rp {{ number_format($payroll->details['deductions']['alpha'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Potongan BPJS</td>
                <td class="text-right">Rp {{ number_format($payroll->details['deductions']['bpjs'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Potongan Pinjaman BMT</td>
                <td class="text-right">Rp {{ number_format(($payroll->details['deductions']['school_loan'] ?? 0) + ($payroll->details['deductions']['bmt_loan'] ?? 0), 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Potongan Koperasi</td>
                <td class="text-right">Rp {{ number_format($payroll->details['deductions']['cooperative'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @if(($payroll->details['deductions']['fixed_settings'] ?? 0) > 0)
            <tr>
                <td>Potongan Lainnya (Sistem)</td>
                <td class="text-right">Rp {{ number_format($payroll->details['deductions']['fixed_settings'], 0, ',', '.') }}</td>
            </tr>
            @endif
            @if(($payroll->deduction_other ?? 0) > 0 || ($payroll->details['deductions']['manual_other'] ?? 0) > 0)
            <tr>
                <td>Potongan Manual (Denda/Kasus)</td>
                <td class="text-right">Rp {{ number_format($payroll->deduction_other ?? $payroll->details['deductions']['manual_other'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr class="subtotal-row">
                <td>TOTAL POTONGAN</td>
                <td class="text-right">Rp {{ number_format($payroll->total_deductions, 0, ',', '.') }}</td>
            </tr>
        </table>

        <!-- Take Home Pay -->
        <div class="thp-container clearfix">
            <span class="thp-label">Gaji Bersih (Take Home Pay)</span>
            <span class="thp-value">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</span>
        </div>

        <!-- Tanda Tangan -->
        <div class="ttd-container">
            <div class="ttd-kiri">
                <p class="titimangsa">&nbsp;</p>
                <p>Penerima,</p>
                <p class="signature-name">{{ $employee->name }}</p>
            </div>
            <div class="ttd-kanan">
                <p class="titimangsa">Dukupuntang, {{ $titimangsaDate }}</p>
                <p>Mengetahui,</p>
                <p class="signature-name">Bendahara / HRD</p>
            </div>
        </div>

        <p class="system-note">*Slip gaji ini dicetak dan di-generate otomatis oleh sistem (SIP-MU Enterprise) pada {{ \Carbon\Carbon::now()->format('d M Y H:i:s') }} dan dianggap sah tanpa stempel basah instansi.</p>
    </div>
</body>
</html>
