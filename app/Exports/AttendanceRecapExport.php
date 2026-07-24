<?php

namespace App\Exports;

use App\Models\Employee;
use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class AttendanceRecapExport implements FromArray, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $month;
    protected $year;
    protected $roleFilter;
    protected $startDate;
    protected $endDate;
    protected $periodLabel;

    public function __construct($month, $year, $roleFilter = 'all')
    {
        $this->month = $month;
        $this->year = $year;
        $this->roleFilter = $roleFilter;

        $settings = \App\Models\SystemSetting::pluck('value', 'key');
        $cutoffType = $settings['recap_cutoff_type'] ?? 'calendar_month';
        
        if ($cutoffType === 'custom_date') {
            $cutoffDay = (int) ($settings['recap_cutoff_day'] ?? 20);
            $this->endDate = \Carbon\Carbon::create($year, $month, $cutoffDay)->endOfDay();
            $this->startDate = $this->endDate->copy()->subMonth()->addDay()->startOfDay();
            
            $startStr = $this->startDate->translatedFormat('d F Y');
            $endStr = $this->endDate->translatedFormat('d F Y');
            $this->periodLabel = "$startStr s.d. $endStr";
        } else {
            $this->startDate = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
            $this->endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth()->endOfDay();
            
            $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            $this->periodLabel = $months[$month] . ' ' . $year;
        }
    }

    public function title(): string
    {
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return 'Rekap ' . $months[$this->month] . ' ' . $this->year;
    }

    public function headings(): array
    {
        return [
            ['REKAP PRESENSI BULANAN - SMK MANBAUL ULUM CIREBON'],
            ['Periode: ' . $this->periodLabel],
            [],
            ['No', 'NIK/NIP', 'Nama Pegawai', 'Jabatan', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', 'JTM Hadir X', 'JTM Hadir XI', 'JTM Hadir XII', 'JTM Hadir Total', 'JTM Izin (I)', 'JTM Inval (Iv)', 'JTM Libur (L)', 'JTM Alpha (A)', 'JTM Terjadwal (T)'],
        ];
    }

    public function array(): array
    {
        $result = \App\Services\AttendanceRecapService::getMonthlyRecap($this->month, $this->year, $this->roleFilter);
        $recapData = $result['recapData'];

        $rows = [];
        $no = 1;
        foreach ($recapData as $row) {
            $hasSchedules = $row['is_guru'] ?? false;

            $rows[] = [
                $no++,
                $row['nik'] ?? '-',
                $row['name'],
                $row['position'] ?? '-',
                $row['present'],
                $row['late'],
                $row['permit'],
                $row['sick'],
                $row['alpha'],
                $hasSchedules ? $row['jtm_effective_10'] : '—',
                $hasSchedules ? $row['jtm_effective_11'] : '—',
                $hasSchedules ? $row['jtm_effective_12'] : '—',
                $hasSchedules ? $row['jtm_effective'] : '—',
                $hasSchedules ? $row['jtm_permit'] : '—',
                $hasSchedules ? $row['jtm_inval'] : '—',
                $hasSchedules ? $row['jtm_holiday'] : '—',
                $hasSchedules ? $row['jtm_absent'] : '—',
                $hasSchedules ? $row['jtm_scheduled'] : '—',
            ];
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 18,
            'C' => 30,
            'D' => 22,
            'E' => 10,
            'F' => 12,
            'G' => 10,
            'H' => 10,
            'I' => 10,
            'J' => 15,
            'K' => 15,
            'L' => 15,
            'M' => 15,
            'N' => 15, // JTM Izin
            'O' => 15, // JTM Inval
            'P' => 15, // JTM Libur
            'Q' => 15, // JTM Alpha
            'R' => 18, // JTM Terjadwal
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Merge header rows
        $sheet->mergeCells('A1:R1');
        $sheet->mergeCells('A2:R2');

        // Title styling
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '4A5568']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Column header styling
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('A4:R4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '4338CA']],
            ],
        ]);

        // Data rows styling
        if ($lastRow > 4) {
            $sheet->getStyle("A5:R{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Center-align numeric columns
            $sheet->getStyle("A5:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E5:R{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Zebra striping
            for ($row = 5; $row <= $lastRow; $row++) {
                if ($row % 2 === 1) {
                    $sheet->getStyle("A{$row}:R{$row}")->applyFromArray([
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
