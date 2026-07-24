<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class EmployeesExport implements WithEvents
{
    private array $rows = [];
    private int $totalRows = 0;

    public function __construct()
    {
        $employees = Employee::with(['positions', 'user'])->orderBy('name')->get();

        foreach ($employees as $emp) {
            $primaryPos = $emp->positions->where('pivot.is_primary', true)->first()
                       ?? $emp->positions->first();

            $this->rows[] = [
                $emp->nik,
                $emp->nik_kependudukan ?? '',
                $emp->nuptk ?? '',
                $emp->name,
                $emp->gender ?? '',
                $emp->birth_place ?? '',
                $emp->birth_date ? $emp->birth_date->format('Y-m-d') : '',
                $emp->user?->email ?? '',
                $emp->phone ?? '',
                $primaryPos?->name ?? '-',
                $emp->join_date ? $emp->join_date->format('Y-m-d') : '',
                $emp->work_duration,
                $emp->education ?? '',
                $emp->subject ?? '',
                $emp->ukg_number ?? '',
                $emp->teaching_hours ?? '',
                $emp->is_certified ? 'Sertifikasi' : 'Non-Sertifikasi',
                $emp->is_homeroom_teacher ? 'Y' : 'T',
                $emp->homeroom_class ?? '',
                $emp->is_extracurricular_builder ? 'Y' : 'T',
                $emp->extracurricular_name ?? '',
                $emp->status === 'active' ? 'Aktif' : 'Non-Aktif',
            ];
        }

        $this->totalRows = count($this->rows);
    }

    private function getHeaders(): array
    {
        return [
            'NIK',
            'NIK Kependudukan',
            'NUPTK',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Email Login',
            'No WhatsApp',
            'Jabatan',
            'Tanggal Mulai Kerja',
            'Masa Kerja',
            'Ijazah Terakhir',
            'Bidang Studi',
            'No UKG',
            'Jam KBM',
            'Status Sertifikasi',
            'Wali Kelas (Y/T)',
            'Kelas Wali',
            'Pembina Eskul (Y/T)',
            'Nama Eskul',
            'Status',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastCol = 'V'; // 22 columns
                $headers = $this->getHeaders();
                $colLetters = range('A', 'V');

                // ─── Row 1: Title ───
                $sheet->setCellValue('A1', 'DATA PEGAWAI - SIP MU Enterprise');
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB('1E293B');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                $sheet->getRowDimension(1)->setRowHeight(30);

                // ─── Row 2: Info ───
                $sheet->setCellValue('A2', 'Diekspor pada: ' . now()->format('d F Y H:i') . ' | Total: ' . $this->totalRows . ' pegawai');
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('64748B');

                // ─── Row 3: Empty spacer ───

                // ─── Row 4: Headers ───
                foreach ($headers as $i => $header) {
                    $cell = $colLetters[$i] . '4';
                    $sheet->setCellValue($cell, $header);
                }
                $sheet->getStyle("A4:{$lastCol}4")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => '4F46E5']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getRowDimension(4)->setRowHeight(28);

                // ─── Row 5+: Data ───
                foreach ($this->rows as $rowIdx => $rowData) {
                    $excelRow = $rowIdx + 5; // data starts at row 5
                    foreach ($rowData as $colIdx => $value) {
                        $cell = $colLetters[$colIdx] . $excelRow;
                        $sheet->setCellValue($cell, $value);
                    }
                }

                // ─── Style data area ───
                $lastDataRow = 4 + $this->totalRows;
                if ($this->totalRows > 0) {
                    $sheet->getStyle("A5:{$lastCol}{$lastDataRow}")->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'D1D5DB'],
                            ],
                        ],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);

                    // Alternating row colors
                    for ($r = 5; $r <= $lastDataRow; $r++) {
                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:{$lastCol}{$r}")->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setRGB('F8FAFC');
                        }
                    }
                }

                // ─── Column widths ───
                $widths = [
                    'A' => 22, 'B' => 20, 'C' => 20, 'D' => 30, 'E' => 16,
                    'F' => 16, 'G' => 16, 'H' => 30, 'I' => 18, 'J' => 22,
                    'K' => 18, 'L' => 18, 'M' => 22, 'N' => 20, 'O' => 16,
                    'P' => 10, 'Q' => 20, 'R' => 16, 'S' => 14, 'T' => 18,
                    'U' => 18, 'V' => 12,
                ];
                foreach ($widths as $col => $w) {
                    $sheet->getColumnDimension($col)->setWidth($w);
                }

                // ─── Freeze pane & auto-filter ───
                $sheet->freezePane('A5');
                $sheet->setAutoFilter("A4:{$lastCol}4");
            },
        ];
    }
}
