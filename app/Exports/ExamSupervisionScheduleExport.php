<?php

namespace App\Exports;

use App\Models\ExamSupervisionSchedule;
use App\Models\Employee;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ExamSupervisionScheduleExport implements FromCollection, WithHeadings, ShouldAutoSize, WithTitle, WithEvents
{
    protected $employee_id;
    protected $isTemplate;

    public function __construct($employee_id = null, $isTemplate = false)
    {
        $this->employee_id = $employee_id;
        $this->isTemplate = $isTemplate;
    }

    public function headings(): array
    {
        return [
            'Hari',
            "Sesi 1\n07:30 - 08:30",
            "Sesi 2\n08:30 - 09:30",
            "Sesi 3\n10:00 - 11:00",
            "Sesi 4\n11:00 - 12:00"
        ];
    }

    public function collection()
    {
        $query = ExamSupervisionSchedule::with(['schoolClass', 'employee']);

        if ($this->employee_id) {
            $query->where('employee_id', $this->employee_id);
        }

        $schedules = $query->get()->groupBy('day_of_week');

        $days = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat'
        ];

        $exportData = [];

        foreach ($days as $dayNum => $dayName) {
            $row = [$dayName];
            $daySchedules = isset($schedules[$dayNum]) ? $schedules[$dayNum]->keyBy('session_number') : collect();

            for ($session = 1; $session <= 4; $session++) {
                if (!$this->isTemplate && $daySchedules->has($session)) {
                    $schedule = $daySchedules->get($session);
                    $className = $schedule->schoolClass->name ?? '';
                    $roomName = $schedule->room_name ? " ({$schedule->room_name})" : '';
                    
                    if ($className) {
                        $row[] = "{$schedule->subject} / {$className}{$roomName}";
                    } else {
                        $row[] = "{$schedule->subject}{$roomName}";
                    }
                } else {
                    $row[] = '';
                }
            }
            $exportData[] = $row;
        }

        // Add instructions
        $exportData[] = ['']; // Blank row separator
        $exportData[] = ['PETUNJUK PENGISIAN JADWAL PENGAWAS UJIAN:'];
        $exportData[] = ['1. Isi sel dengan format: "Mata Pelajaran Ujian / Nama Kelas (Ruang Ujian)" (Contoh: "Matematika / X TJKT-1 (Lab Komputer 1)" atau "Bahasa Indonesia / XI AKL-2").'];
        $exportData[] = ['2. Kosongkan sel jika tidak ada tugas mengawas ujian pada sesi tersebut.'];
        $exportData[] = ['3. Pastikan Nama Kelas sesuai dengan data kelas di sistem SIP-MU.'];
        $exportData[] = ['4. Jangan mengubah atau menghapus nama Hari pada kolom pertama (A).'];

        return collect($exportData);
    }

    public function title(): string
    {
        return 'Jadwal Pengawas Ujian';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Style headings
                $sheet->getStyle('A1:E1')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E2E8F0']
                    ]
                ]);
                $sheet->getRowDimension(1)->setRowHeight(40);

                // Style data grid
                $sheet->getStyle('A2:E6')->applyFromArray([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ]
                ]);

                // Hari column bold
                $sheet->getStyle('A2:A6')->getFont()->setBold(true);

                // Set row heights for data
                for ($i = 2; $i <= 6; $i++) {
                    $sheet->getRowDimension($i)->setRowHeight(45);
                }

                // Style column widths
                $sheet->getColumnDimension('A')->setWidth(15);
                foreach (range('B', 'E') as $col) {
                    $sheet->getColumnDimension($col)->setWidth(35);
                }

                // Style Instructions
                $sheet->getStyle('A8:A12')->getFont()->getColor()->setRGB('475569');
                $sheet->getStyle('A8')->getFont()->setBold(true);
            },
        ];
    }
}
