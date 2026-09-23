<?php

namespace App\Exports;

use App\Models\Employee;
use App\Models\ExamSupervisionAttendance;
use App\Services\ExamRecapService;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ExamSupervisionRecapExport implements FromArray, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $month;
    protected $year;
    protected $roleFilter;

    public function __construct($month, $year, $roleFilter = 'all')
    {
        $this->month = $month;
        $this->year = $year;
        $this->roleFilter = $roleFilter;
    }

    public function array(): array
    {
        $result = ExamRecapService::getMonthlyRecap($this->month, $this->year, $this->roleFilter);
        $recapData = $result['recapData'];

        $exportData = [];
        $no = 1;

        foreach ($recapData as $item) {
            $exportData[] = [
                $no++,
                $item['name'],
                $item['nik'] ?: '-',
                $item['position'],
                $item['present'],
                $item['late'],
                $item['total_attended'],
            ];
        }

        return $exportData;
    }

    public function headings(): array
    {
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $monthName = $months[$this->month];
        
        return [
            ['REKAPITULASI PRESENSI MENGAWAS UJIAN'],
            ['PERIODE: ' . strtoupper($monthName) . ' ' . $this->year],
            [],
            [
                'NO',
                'NAMA PEGAWAI',
                'NIK / NBM',
                'JABATAN',
                'HADIR (TEPAT WAKTU)',
                'TERLAMBAT',
                'TOTAL SESI MENGAWAS',
            ]
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'G';
        
        $sheet->mergeCells('A1:G1');
        $sheet->mergeCells('A2:G2');
        
        $sheet->getStyle('A1:A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ]
        ]);
        
        $sheet->getStyle("A4:{$lastCol}4")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'], 
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ]
        ]);
        
        $sheet->getStyle("A4:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => '000000'],
                ],
            ],
        ]);
        
        $sheet->getStyle("A5:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("E5:G{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,
            'B' => 35,
            'C' => 20,
            'D' => 25,
            'E' => 15,
            'F' => 15,
            'G' => 25,
        ];
    }

    public function title(): string
    {
        return 'Rekap Ujian';
    }
}
