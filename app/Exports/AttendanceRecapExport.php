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

    public function __construct($month, $year, $roleFilter = 'all')
    {
        $this->month = $month;
        $this->year = $year;
        $this->roleFilter = $roleFilter;
    }

    public function title(): string
    {
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return 'Rekap ' . $months[$this->month] . ' ' . $this->year;
    }

    public function headings(): array
    {
        $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return [
            ['REKAP PRESENSI BULANAN - SMK MANBAUL ULUM CIREBON'],
            ['Periode: ' . $months[$this->month] . ' ' . $this->year],
            [],
            ['No', 'NIK/NIP', 'Nama Pegawai', 'Jabatan', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha', 'Total Jam Mengajar'],
        ];
    }

    public function array(): array
    {
        $employees = Employee::with(['positions', 'user.roles'])->where('status', 'active')->get();

        if ($this->roleFilter === 'Guru') {
            $employees = $employees->filter(fn($emp) => $emp->teachingSchedules()->exists());
        } elseif ($this->roleFilter === 'Staff') {
            $employees = $employees->filter(fn($emp) => !$emp->teachingSchedules()->exists());
        }

        // Get working days
        $daysInMonth = \Carbon\Carbon::create($this->year, $this->month, 1)->daysInMonth;
        $workingDaysDates = [];
        $holidays = \App\Models\Holiday::whereMonth('date', $this->month)->whereYear('date', $this->year)->pluck('date')->map(fn($d) => \Carbon\Carbon::parse($d)->format('Y-m-d'))->toArray();

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = \Carbon\Carbon::create($this->year, $this->month, $i);
            if ($date->isWeekday()) {
                if (!in_array($date->format('Y-m-d'), $holidays)) {
                    $workingDaysDates[] = $date->format('Y-m-d');
                }
            }
        }

        $rows = [];
        $no = 1;
        foreach ($employees->sortBy('name') as $emp) {
            $attendances = Attendance::where('employee_id', $emp->id)
                ->whereMonth('date', $this->month)
                ->whereYear('date', $this->year)
                ->get()
                ->keyBy(fn($a) => \Carbon\Carbon::parse($a->date)->format('Y-m-d'));

            $leaves = \App\Models\LeaveRequest::where('employee_id', $emp->id)
                ->where('status', 'approved')
                ->where(function ($q) {
                    $q->whereMonth('start_date', $this->month)->whereYear('start_date', $this->year)
                      ->orWhereMonth('end_date', $this->month)->whereYear('end_date', $this->year);
                })->get();

            $presentCount = 0;
            $lateCount = 0;
            $permitCount = 0;
            $sickCount = 0;
            $alphaCount = 0;

            foreach ($workingDaysDates as $wDate) {
                if ($attendances->has($wDate)) {
                    $att = $attendances->get($wDate);
                    if ($att->status === 'present') $presentCount++;
                    elseif ($att->status === 'late') $lateCount++;
                    elseif ($att->status === 'alpha') $alphaCount++;
                    elseif ($att->status === 'permit') $permitCount++;
                    elseif ($att->status === 'sick') $sickCount++;
                } else {
                    $onLeave = false;
                    foreach ($leaves as $leave) {
                        $start = \Carbon\Carbon::parse($leave->start_date);
                        $end = \Carbon\Carbon::parse($leave->end_date);
                        $current = \Carbon\Carbon::parse($wDate);
                        if ($current->betweenIncluded($start, $end)) {
                            $onLeave = true;
                            if ($leave->type === 'Sakit') $sickCount++;
                            else $permitCount++;
                            break;
                        }
                    }
                    if (!$onLeave) {
                        $alphaCount++;
                    }
                }
            }

            $rows[] = [
                $no++,
                $emp->nik ?? $emp->nip ?? '-',
                $emp->name,
                $emp->positions->pluck('name')->join(', ') ?: '-',
                $presentCount,
                $lateCount,
                $permitCount,
                $sickCount,
                $alphaCount,
                $attendances->sum('teaching_hours'),
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
            'J' => 18,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Merge header rows
        $sheet->mergeCells('A1:J1');
        $sheet->mergeCells('A2:J2');

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
        $sheet->getStyle('A4:J4')->applyFromArray([
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
            $sheet->getStyle("A5:J{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Center-align numeric columns
            $sheet->getStyle("A5:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E5:J{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Zebra striping
            for ($row = 5; $row <= $lastRow; $row++) {
                if ($row % 2 === 1) {
                    $sheet->getStyle("A{$row}:J{$row}")->applyFromArray([
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
