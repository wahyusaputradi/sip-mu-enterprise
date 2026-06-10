<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\CampusLocation;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Carbon\Carbon;

class MonitoringExport implements FromArray, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $date;

    public function __construct($date = null)
    {
        $this->date = $date ?: Carbon::today()->toDateString();
    }

    public function title(): string
    {
        return 'Monitoring ' . Carbon::parse($this->date)->translatedFormat('d M Y');
    }

    public function headings(): array
    {
        $dateFormatted = Carbon::parse($this->date)->translatedFormat('l, d F Y');
        return [
            ['MONITORING PRESENSI HARIAN - SMK MANBAUL ULUM CIREBON'],
            ['Tanggal: ' . $dateFormatted],
            [],
            ['No', 'NIK/NIP', 'Nama Pegawai', 'Jabatan', 'Waktu Masuk', 'Waktu Keluar', 'Status', 'Lokasi Kampus'],
        ];
    }

    public function array(): array
    {
        $attendances = Attendance::with('employee.positions')
            ->whereDate('date', $this->date)
            ->get();

        $campusLocations = CampusLocation::all();

        $statusLabels = [
            'present' => 'Hadir',
            'late' => 'Terlambat',
            'alpha' => 'Alpha',
            'permit' => 'Izin',
            'sick' => 'Sakit',
        ];

        $rows = [];
        $no = 1;
        foreach ($attendances->sortBy('employee.name') as $att) {
            $rows[] = [
                $no++,
                $att->employee->nik ?? $att->employee->nip ?? '-',
                $att->employee->name ?? 'Unknown',
                $att->employee->positions->pluck('name')->join(', ') ?: '-',
                $att->check_in ? substr($att->check_in, 0, 5) : '-',
                $att->check_out ? substr($att->check_out, 0, 5) : '-',
                $statusLabels[$att->status] ?? $att->status,
                $this->resolveCampusName($att->latitude, $att->longitude, $campusLocations),
            ];
        }

        return $rows;
    }

    private function resolveCampusName($lat, $lng, $campusLocations)
    {
        if (!$lat || !$lng) return '-';

        $closest = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($campusLocations as $campus) {
            $earthRadius = 6371000;
            $dLat = deg2rad($campus->latitude - $lat);
            $dLng = deg2rad($campus->longitude - $lng);
            $a = sin($dLat / 2) * sin($dLat / 2) +
                 cos(deg2rad($lat)) * cos(deg2rad($campus->latitude)) *
                 sin($dLng / 2) * sin($dLng / 2);
            $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $closest = $campus;
            }
        }

        if ($closest && $minDistance <= $closest->radius) {
            return $closest->name;
        }

        return 'Di Luar Jangkauan';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 18,
            'C' => 30,
            'D' => 22,
            'E' => 14,
            'F' => 14,
            'G' => 14,
            'H' => 30,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:H1');
        $sheet->mergeCells('A2:H2');

        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '4A5568']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('A4:H4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '3B82F6'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '2563EB']],
            ],
        ]);

        if ($lastRow > 4) {
            $sheet->getStyle("A5:H{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']],
                ],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getStyle("A5:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E5:G{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            for ($row = 5; $row <= $lastRow; $row++) {
                if ($row % 2 === 1) {
                    $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8FAFC'],
                        ],
                    ]);
                }
            }
        }

        return [];
    }
}
