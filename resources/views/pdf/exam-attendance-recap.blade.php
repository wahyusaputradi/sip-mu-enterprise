<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Presensi Mengawas Ujian - {{ $monthName }} {{ $year }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #333; line-height: 1.3; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
        .logo { width: 60px; height: auto; position: absolute; top: 0; left: 0; }
        .school-name { font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0; }
        .title { font-size: 14px; font-weight: bold; margin: 5px 0 0 0; }
        .period { font-size: 11px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 4px; text-align: center; }
        th { background-color: #f8fafc; font-weight: bold; color: #1e293b; font-size: 9px; text-transform: uppercase; }
        td.name-col { text-align: left; }
        .summary-box { margin-top: 20px; width: 300px; border: 1px solid #ddd; padding: 10px; background-color: #f8fafc; }
        .summary-box table { margin: 0; border: none; }
        .summary-box th, .summary-box td { border: none; padding: 3px; text-align: left; font-size: 10px; background: transparent; text-transform: none; }
        .footer { margin-top: 30px; width: 100%; }
        .footer-table { width: 100%; border: none; margin-top: 40px; }
        .footer-table th, .footer-table td { border: none; padding: 5px; text-align: center; background: transparent; }
        .signature-line { width: 150px; border-bottom: 1px solid #333; margin: 50px auto 5px auto; }
        .print-info { font-size: 8px; color: #94a3b8; text-align: right; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="school-name">SIP MU Enterprise</h1>
        <h2 class="title">REKAPITULASI PRESENSI MENGAWAS UJIAN PEGAWAI</h2>
        <p class="period">Periode: {{ $periodLabel }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="22%">Nama Pegawai</th>
                <th width="12%">NIK / NBM</th>
                <th width="15%">Jabatan</th>
                <th width="10%">Hadir (Tepat)</th>
                <th width="10%">Terlambat</th>
                <th width="12%">Total Sesi Mengawas</th>
            </tr>
        </thead>
        <tbody>
            @forelse($recapData as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="name-col"><strong>{{ $item['name'] }}</strong></td>
                    <td>{{ $item['nik'] ?: '-' }}</td>
                    <td>{{ $item['position'] }}</td>
                    <td>{{ $item['present'] }}</td>
                    <td>{{ $item['late'] }}</td>
                    <td><strong>{{ $item['total_attended'] }} Sesi</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data kehadiran mengawas ujian pada bulan ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <strong>Ringkasan Periode Ujian:</strong>
        <table>
            <tr><td width="60%">Total Hadir (Tepat Waktu)</td><td>: {{ $stats['present'] }} Sesi</td></tr>
            <tr><td>Total Terlambat</td><td>: {{ $stats['late'] }} Sesi</td></tr>
            <tr><td><strong>Total Keseluruhan Kehadiran</strong></td><td><strong>: {{ $stats['present'] + $stats['late'] }} Sesi</strong></td></tr>
        </table>
    </div>

    <table class="footer-table">
        <tr>
            <td width="33%">
                Mengetahui,<br>
                <strong>Kepala Sekolah</strong>
                <div class="signature-line"></div>
                NBM. .......................
            </td>
            <td width="33%"></td>
            <td width="33%">
                ................, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Ketua Panitia Ujian</strong>
                <div class="signature-line"></div>
                NBM. .......................
            </td>
        </tr>
    </table>

    <div class="print-info">
        Dicetak oleh sistem pada: {{ $printDate }}
    </div>
</body>
</html>
