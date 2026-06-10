<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monitoring Presensi Harian</title>
    <style>
        @page { margin: 15mm 12mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.4; }
        
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #3b82f6; }
        .header h1 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 2px; letter-spacing: -0.5px; }
        .header h2 { font-size: 14px; font-weight: 700; color: #3b82f6; margin-bottom: 4px; }
        .header p { font-size: 10px; color: #64748b; font-weight: 600; }
        
        .stats-row { display: table; width: 100%; margin-bottom: 18px; }
        .stat-box { display: table-cell; text-align: center; padding: 8px 4px; width: 20%; }
        .stat-inner { border-radius: 8px; padding: 10px 6px; }
        .stat-inner.hadir { background: #ecfdf5; border: 1px solid #a7f3d0; }
        .stat-inner.telat { background: #fffbeb; border: 1px solid #fde68a; }
        .stat-inner.izin { background: #eff6ff; border: 1px solid #bfdbfe; }
        .stat-inner.sakit { background: #faf5ff; border: 1px solid #e9d5ff; }
        .stat-inner.alpa { background: #fff1f2; border: 1px solid #fecdd3; }
        .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .stat-label.hadir { color: #059669; }
        .stat-label.telat { color: #d97706; }
        .stat-label.izin { color: #2563eb; }
        .stat-label.sakit { color: #7c3aed; }
        .stat-label.alpa { color: #e11d48; }
        .stat-value { font-size: 22px; font-weight: 800; color: #0f172a; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #3b82f6; color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 8px; text-align: center; }
        th:nth-child(1) { text-align: center; width: 5%; }
        th:nth-child(2) { text-align: left; width: 12%; }
        th:nth-child(3) { text-align: left; width: 20%; }
        th:nth-child(4) { text-align: left; width: 14%; }
        td { padding: 8px; font-size: 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
        td:nth-child(1) { text-align: center; }
        td:nth-child(n+5) { text-align: center; font-weight: 700; }
        tr:nth-child(even) { background: #f8fafc; }
        
        .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
        .badge-hadir { background: #d1fae5; color: #065f46; }
        .badge-telat { background: #fef3c7; color: #92400e; }
        .badge-izin { background: #dbeafe; color: #1e40af; }
        .badge-sakit { background: #ede9fe; color: #5b21b6; }
        .badge-alpa { background: #ffe4e6; color: #9f1239; }
        .badge-kampus { background: #e0e7ff; color: #3730a3; }
        .badge-luar { background: #ffe4e6; color: #9f1239; }
        
        .footer { margin-top: 25px; padding-top: 12px; border-top: 2px solid #e2e8f0; display: table; width: 100%; }
        .footer-left { display: table-cell; text-align: left; vertical-align: middle; }
        .footer-right { display: table-cell; text-align: right; vertical-align: middle; }
        .footer p { font-size: 9px; color: #94a3b8; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SMK MANBAUL ULUM CIREBON</h1>
        <h2>Monitoring Presensi Harian</h2>
        <p>Tanggal: {{ $dateFormatted }} &mdash; Dicetak pada {{ $printDate }}</p>
    </div>

    <div class="stats-row">
        <div class="stat-box"><div class="stat-inner hadir"><div class="stat-label hadir">Hadir</div><div class="stat-value">{{ $stats['present'] }}</div></div></div>
        <div class="stat-box"><div class="stat-inner telat"><div class="stat-label telat">Terlambat</div><div class="stat-value">{{ $stats['late'] }}</div></div></div>
        <div class="stat-box"><div class="stat-inner izin"><div class="stat-label izin">Izin</div><div class="stat-value">{{ $stats['permit'] }}</div></div></div>
        <div class="stat-box"><div class="stat-inner sakit"><div class="stat-label sakit">Sakit</div><div class="stat-value">{{ $stats['sick'] }}</div></div></div>
        <div class="stat-box"><div class="stat-inner alpa"><div class="stat-label alpa">Alpha</div><div class="stat-value">{{ $stats['alpha'] }}</div></div></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>NIK/NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Status</th>
                <th>Lokasi Kampus</th>
            </tr>
        </thead>
        <tbody>
            @php $statusLabels = ['present'=>'Hadir','late'=>'Terlambat','alpha'=>'Alpha','permit'=>'Izin','sick'=>'Sakit']; @endphp
            @php $statusBadge = ['present'=>'badge-hadir','late'=>'badge-telat','alpha'=>'badge-alpa','permit'=>'badge-izin','sick'=>'badge-sakit']; @endphp
            @foreach ($attendances as $index => $att)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $att->employee->nik ?? $att->employee->nip ?? '-' }}</td>
                <td style="font-weight: 600;">{{ $att->employee->name ?? 'Unknown' }}</td>
                <td>{{ $att->employee->positions->pluck('name')->join(', ') ?: '-' }}</td>
                <td>{{ $att->check_in ? substr($att->check_in, 0, 5) : '-' }}</td>
                <td>{{ $att->check_out ? substr($att->check_out, 0, 5) : '-' }}</td>
                <td><span class="badge {{ $statusBadge[$att->status] ?? '' }}">{{ $statusLabels[$att->status] ?? $att->status }}</span></td>
                <td style="text-align: center;">
                    @if($att->campus_name)
                        <span class="badge {{ $att->campus_name === 'Di Luar Jangkauan' ? 'badge-luar' : 'badge-kampus' }}">{{ $att->campus_name }}</span>
                    @else
                        -
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <div class="footer-left"><p>SIP MU Enterprise &copy; {{ date('Y') }} &mdash; Sistem Informasi Presensi</p></div>
        <div class="footer-right"><p>Dokumen ini digenerate secara otomatis oleh sistem</p></div>
    </div>
</body>
</html>
